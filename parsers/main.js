"use strict";
const Xray = require('x-ray');
const phantom = require('x-ray-phantom');
const NightmareElectron = require('x-ray-nightmare');
const debug = require('debug')('parser:Main');
const Parse=require('../models/Parse');
const SantehraiDb=require('../models/Santehrai');
const Santehrai = new SantehraiDb();
const StevianDb=require('../models/Stevian');
const Stevian = new StevianDb();
const SkuModel = require('../models/SkuMapping');
const SkuModelObj=new SkuModel();
const requestXray = require('../drivers/request');

const options = {
    method: "GET", 						//Set HTTP method
    jar: true, 							//Enable cookies
    proxy: true, 							//Enable cookies
    headers: {							//Set headers
        "User-Agent": "Firefox/48.0"
    }
};

const requestDriver = requestXray(options);	//Create driver


function getScreenshot(ctx, nightmare) {
    nightmare.goto(ctx.url)
        .screenshot('page.png').cookies.get({
        path: '/',
        secure: true
    })
        .then(cookies => {
            console.log(cookies);
        });
}

// instantiate driver for later shutdown
let nightmareDriver = NightmareElectron({
    waitTimeout: 10000,
    loadTimeout: 10000,
    // switches: {
    //     'proxy-server': "",
    //     'ignore-certificate-errors': true
    // }
});

const cyrillicPattern = /[\u0400-\u04FF]/;
const sizePattern = /[0-9][0-9][0-9][x][0-9][0-9]/;


require('process');
class MainParser {
    constructor (url) {

        this.x = Xray({
            filters: {
                trim: function (value) {
                    // Replace also white char ascii code 160
                    return typeof value === 'string' ? value.replace(/\xA0/g, ' ').trim() : value
                },
                reverse: function (value) {
                    return typeof value === 'string' ? value.split('').reverse().join('') : value
                },
                join: function (value, sep) {
                    return typeof value === 'string' ? value.split('').join(sep) : value
                },
                slice: function (value, start, end) {
                    debug('slice on value:', value)
                    return typeof value === 'string' ? value.slice(start, end) : value
                },
                split: function (value, sep, index) {
                    debug('split on value:', value, 'sep:', sep, 'index:', index)
                    return typeof value === 'string' ? value.split(sep)[index] : value
                },
                replaceComma: function (value) {
                    debug('Replacing comma in:', value)
                    return typeof value === 'string' ? value.replace(',', '.') : value
                },
                deleteComma: function (value) {
                    debug('Replacing comma in:', value)
                    return typeof value === 'string' ? value.replace(',', '') : value
                },
                replaceSpace: function (value) {
                    debug('Replacing space in:', value)
                    return typeof value === 'string' ? value.replace(/ /g, '') : value
                },
                float: function (value) {
                    debug('Casting', value, 'to float')
                    return typeof value === 'string' ? parseFloat(value) : value
                },
                int: function (value) {
                    debug('Casting', value, 'to int')
                    return typeof value === 'string' ? parseInt(value) : value
                },
                number: function (value) {
                    const regex = /[+-]?([0-9]*[.])?[0-9]+/;
                    return (regex.exec(value) !== null) ? regex.exec(value)[0] : value
                },
                waveshopPrice: function (value) {
                    if(value.indexOf('dynx_totalvalue') !== -1){
                        let rxp = /{([^}]+)}/g,
                            curMatch;

                        curMatch = rxp.exec( value ) ;


                        let matchArr = curMatch[1].split(',');
                        let result=false;
                        for (let i = 0; i < matchArr.length; i++) {
                            if (matchArr[i].indexOf('dynx_totalvalue') !==-1){
                                result = matchArr[i].replace('dynx_totalvalue:','').trim();
                            }
                        }
                        if(result){
                            return result;
                        }
                    }else{
                        return false;
                    }
                },
            }
        })
            .driver(requestDriver)
            // .driver(phantom({webSecurity:false, dnodeOpts: {
            //         weak: false
            //     }}))

            // .driver(nightmareDriver)
            // .limit(2)
            .concurrency(10)
            .throttle(5)
            .delay(3000);
                this.mainUrl = url;
            }

    parseProducts(options,resolve,reject){

        const xrayProvider = this.x;

        const obj = this;
        xrayProvider(this.mainUrl, {
            title: options.title,
            items: this.x(options.main_items, [{
                url: options.main_urls,
            }]),

        }).then(function (res){
            let globalResLength = 0;

            let global_count = 0;

            let promisesMain = [];

            let count_subpromise = 0;
            for(let j =0; j<res.items.length;j++){
                let url = options.add_to_url ? res.items[j].url+options.add_to_url :  res.items[j].url;
                // console.log(url);
                promisesMain.push(new Promise(function (resolveMain,rejectMain) {

                    xrayProvider(url, {
                        title: options.product_title,
                        items: xrayProvider(options.product_items, [{
                            title:options.product_title,
                            link:options.product_url,
                            price: options.product_price,
                            identificator: options.product_category_manufacturer_tag ? options.product_category_manufacturer_tag : false
                        }]),

                    })
                        .paginate(options.paginate_link)
                        .limit(options.paginate_limit)

                        .then(function (res){

                            let promises = [];
                            for(let i =0; i<res.length;i++){

                                globalResLength= parseInt(globalResLength) + parseInt(res[i].items.length);

                                for(let j =0; j<res[i].items.length;j++){
                                    if(res[i].items[j].link){

                                        let result = {
                                            link:null,
                                            title:null,
                                            price:null,
                                            identificator:null,
                                            stevian_product_id:null,
                                            santehrai_product_id:null,
                                            created_at:new Date(),
                                        };
                                        result.title = res[i].items[j].title;
                                        result.link = res[i].items[j].link;

                                        let split_title = (res[i].items[j].title)  ? res[i].items[j].title.split(' ') : '';

                                        let title_index = split_title.length-1;


                                        /**
                                         * Getting sku from category page
                                         */
                                        if(options.product_category_manufacturer_tag && res[i].items[j].identificator ){
                                            if(res[i].items[j].identificator  instanceof Array){
                                                for(let n =0;n<res[i].items[j].identificator.length;n++){
                                                    if(res[i].items[j].identificator[n].indexOf(options.product_category_manufacturer_text)!==-1){
                                                        result.identificator = res[i].items[j].identificator[n].replace(options.product_manufacturer_text,'').replace(/[^\w\-\+\&\s]/g, '').trim();
                                                        break;
                                                    }
                                                }
                                            }else
                                                if(res[i].items[j].identificator.indexOf(options.product_category_manufacturer_text) !==-1){
                                                    result.identificator = res[i].items[j].identificator.replace(options.product_category_manufacturer_text,'').replace(/[^\w\-\+\&\s]/g, '').trim();
                                                }
                                        }else{
                                            for(let it = split_title.length-1; it>0;it-- ){
                                                title_index = it;
                                                if(cyrillicPattern.test(split_title[it]) == false && sizePattern.test(split_title[it]) == false){
                                                    result.identificator = split_title[it].replace(/[^\w\-\+\&\s]/g, '');
                                                    title_index = it;
                                                    break;
                                                }
                                            }
                                        }



                                        /**
                                         * Getting price from category page
                                         */
                                        if( res[i].items[j].price instanceof Array){
                                            if(res[i].items[j].price.length>1){
                                                result.price =res[i].items[j].price[1];
                                            }else{
                                                result.price =res[i].items[j].price[0];
                                            }
                                        }else{
                                            result.price = res[i].items[j].price;
                                        }



                                        /**
                                         * Getting stevian product by identificator
                                         */
                                        promises.push(new Promise(function (resolveAll,rejectAll) {
                                                    Stevian.getProductBySku(result.identificator).then(row=>{
                                                        let stevian_identificator =row;
                                                        if(stevian_identificator && stevian_identificator[0] && stevian_identificator[0].entity_id && result.price !==null && result.price !==undefined ){
                                                            result.stevian_product_id = stevian_identificator[0].entity_id;
                                                            Parse.add(result,function (err,count) {
                                                                global_count++;
                                                                console.log('global_count1:'+global_count+' globalResLength:'+globalResLength);
                                                                resolveAll(resolve);
                                                            });
                                                        }else{
                                                            if(options.product_manufacturer_tag){

                                                                /**
                                                                 * Getting sku from product page
                                                                 */
                                                                xrayProvider(result.link, {
                                                                    price: options.product_page_price ? options.product_page_price : '',
                                                                    attributes: xrayProvider(options.product_manufacturer_tag,
                                                                        [{
                                                                        sku: options.product_manufacturer_child
                                                                    }]
                                                                    ),
                                                                }) .then(function (res_product){

                                                                    /**
                                                                     * Getting price from product page
                                                                     */
                                                                    if(res_product.price && res_product.price instanceof Array && result.price == null){
                                                                        result.price = res_product.price.filter(function(x) {
                                                                            return x;
                                                                        });
                                                                        if(result.price instanceof Array){
                                                                            result.price = result.price[0] ?  result.price[0] :  result.price;
                                                                        }
                                                                    }

                                                                    for(let k =0; k<res_product.attributes.length;k++){
                                                                        if(res_product.attributes[k].sku instanceof Array){

                                                                            if(res_product.attributes[k].sku  &&  res_product.attributes[k].sku[0] == options.product_manufacturer_text){
                                                                                result.identificator = res_product.attributes[k].sku[1].replace(/[^\w\-\&\s]/g, '');
                                                                                break;

                                                                            }else{
                                                                                for(let ps = 0;ps<res_product.attributes[k].sku.length;ps++){
                                                                                    if(res_product.attributes[k].sku[ps].indexOf(options.product_manufacturer_text)!==-1){
                                                                                        result.identificator = res_product.attributes[k].sku[ps].replace(options.product_manufacturer_text,'').replace(/[^\w\-\+\&\s]/g, '').trim();
                                                                                        break;
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                        else {
                                                                            if(res_product.attributes[k].sku.indexOf(options.product_manufacturer_text)){
                                                                                result.identificator = res_product.attributes[k].sku.replace(options.product_manufacturer_text,'').replace(/[^\w\-\+\&\s]/g, '').trim();
                                                                                break;
                                                                            }
                                                                        }

                                                                    }
                                                                    Stevian.getProductBySku(result.identificator).then(row=>{
                                                                        let stevian_identificator =row;
                                                                        if(stevian_identificator && stevian_identificator!=='' && stevian_identificator!==undefined && stevian_identificator[0]){
                                                                            result.stevian_product_id = stevian_identificator[0].entity_id;
                                                                        }
                                                                        Parse.add(result,function (err,count) {
                                                                            global_count++;
                                                                            console.log('global_count5:'+global_count+' globalResLength5:'+globalResLength);
                                                                            resolveAll(resolve);
                                                                        });
                                                                    })

                                                                        .catch(err=>{
                                                                            // Stevian.close();
                                                                            console.log(err);
                                                                        Parse.add(result,function (err,count) {
                                                                            global_count++;
                                                                            console.log('global_count6:'+global_count+' globalResLength6:'+globalResLength);
                                                                            resolveAll(resolve);
                                                                        });
                                                                    });



                                                                }).catch(e=>{
                                                                    console.log(e);
                                                                    Parse.add(result,function (err,count) {
                                                                        global_count++;
                                                                        console.log('global_count71:'+global_count+' globalResLength:'+globalResLength);
                                                                        resolveAll(resolve);
                                                                    });
                                                                })

                                                            }else{
                                                                Parse.add(result,function (err,count) {
                                                                    global_count++;
                                                                    console.log('global_count72:'+global_count+' globalResLength:'+globalResLength);
                                                                    resolveAll(resolve);
                                                                });
                                                            }

                                                        }

                                                    })
                                                        // .then(() => {
                                                        //     // Stevian.close();
                                                        // })
                                                        .catch(err=>{
                                                            // Stevian.close();
                                                            console.log(err);
                                                            Parse.add(result,function (err,count) {
                                                                global_count++;
                                                                console.log('global_count9:'+global_count+' globalResLength:'+globalResLength);
                                                                resolveAll(resolve);
                                                            });
                                                        });


                                        }));


                                    }else{
                                        console.log('no link');
                                    }
                                }
                            }
                            Promise.all(promises)
                                .then(all_result => {
                                    count_subpromise++;
                                    console.log('finish sub promise'+count_subpromise);
                                    resolveMain(resolve);
                                    console.log('mainlinkPromise:'+url);
                                })
                                .catch((e) => {
                                    console.log(e);
                                    resolveMain(resolve);
                                });


                        })
                        .catch(function (err) {
                            resolveMain(resolve);
                            console.log('ERRRORRR!');// handle error in promise
                            console.log(err) // handle error in promise
                        })
                }));


            }
            Promise.all(promisesMain)
                .then(all_result => {
                    console.log('finish main promises');
                    obj.ProcessSantehrai(all_result[0]);
                })
                .catch((e) => {
                    console.log(e);
                });


        })
            .catch(function (err) {
                console.log('ERRRORRR!22') // handle error in promise
                console.log(err) // handle error in promise
                resolve();
            });
    }

    ProcessSantehrai(resolve){

        const obj = this;
        Parse.list(function (err,rows) {
            console.log('start process santehrai');
            if(rows && !err){
                let count_update= 0;
                let length_update= rows.length;

                console.log('Santehrai update rows:'+ rows.length);
                let promisesSanthrai = [];

                // gracefully shutdown driver
                // nightmareDriver();

                for(let i=0;i<rows.length;i++){
                    let sku = rows[i].identificator;
                    let parse_res_id = rows[i].id;
                        promisesSanthrai.push(new Promise(function (resolveSantehrai,rejectAll) {
                            SkuModelObj.getSku(sku,'santehrai')
                                .then(sku_map=>{
                                        if(sku_map && sku_map[0] && sku_map[0].current_sku){
                                            sku = sku_map[0].current_sku;
                                        }
                                        Santehrai.getProductBySku(sku).then(santehrai_row=>{
                                            if(!err && santehrai_row && santehrai_row[0]){
                                                Parse.updateSantehraiById(parse_res_id, santehrai_row[0].id, function () {
                                                    count_update++;
                                                });
                                            }else{
                                                count_update++;
                                            }
                                            return resolveSantehrai(count_update);
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                    })
                                .catch(err_map=>{
                                    console.log(err_map);
                                    count_update++;
                                    return resolveSantehrai(count_update);
                                });
                        }));




                }

                Promise.all(promisesSanthrai)
                    .then(results => {
                        console.log('finish process santehrai');
                        obj.ProcessStevian(resolve);
                    })
                    .catch((e) => {
                        console.log(e);
                    });


            }
        })
    }



    ProcessStevian(resolve){
        Parse.list(function (err,rows) {
            console.log('start process stevian');
            if(rows && !err){
                let count_update= 0;
                let length_update= rows.length;

                console.log('Stevian update rows:'+ rows.length);
                let promisesStevian = [];

                // gracefully shutdown driver
                // nightmareDriver();

                for(let i=0;i<rows.length;i++){
                    let sku = rows[i].identificator;
                    let parse_res_id = rows[i].id;
                    promisesStevian.push(new Promise(function (resolveStevian,rejectAll) {
                        SkuModelObj.getSku(sku,'stevian')
                            .then(sku_map=>{
                                if(sku_map && sku_map[0] && sku_map[0].current_sku){
                                    sku = sku_map[0].current_sku;
                                }
                                Stevian.getProductBySku(sku).then(stevian_row=>{
                                    if(!err && stevian_row && stevian_row[0]){
                                        Parse.updateStevianById(parse_res_id, stevian_row[0].entity_id, function () {
                                            count_update++;
                                        });
                                    }else{
                                        count_update++;
                                    }
                                    return resolveStevian(count_update);
                                })
                                    .catch(err => {
                                        console.log(err);
                                    })
                            })
                            .catch(err_map=>{
                                console.log(err_map);
                                count_update++;
                                return resolveStevian(count_update);
                            });
                    }));




                }

                Promise.all(promisesStevian)
                    .then(results => {
                        console.log('finish process stevian');
                        resolve();
                    })
                    .catch((e) => {
                        console.log(e);
                    });


            }
        })
    }
}




module.exports = MainParser;
