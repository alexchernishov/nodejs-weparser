const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const filterQuery = require('../validation/filter-query');
const fs = require('fs');
const path = require('path');

const parsed_sites = require( "../parsers/sites-map");
const specification = require( "../export-specifications/main-specification");
const ourSpecification = require( "../export-specifications/our-specification");
const theirSpecification = require( "../export-specifications/their-specification");
const excel = require('node-excel-export');
const ParseDb=require('../models/ParsePromise');
const Parse=new ParseDb();
const SantehraiDb=require('../models/Santehrai');
const Santehrai = new SantehraiDb();
const StevianDb=require('../models/Stevian');
const Stevian = new StevianDb();
router.get('/',  passport.authenticate('jwt', { session: false }), function(req, res, next) {

    let filters = filterQuery(req.query);
    if(req.query.export){
        req.query.limit = 999999;
    }
    Parse.getListBySite(req.query.limit,req.query.page,req.query.site,filters)
        .then(rows => {

                let main_site = (req.query.site == 'santehrai') ? Santehrai : Stevian;
                let second_site = (req.query.site == 'santehrai') ? Stevian : Santehrai;
                let main_id = (req.query.site == 'santehrai') ? 'santehrai' : 'stevian';
                let second_id = (req.query.site == 'santehrai') ? 'stevian' : 'santehrai';
                let main_name = (req.query.site == 'santehrai') ? 'label' : 'label';
                let second_name = (req.query.site == 'santehrai') ? 'label' : 'label';
                let main_link = (req.query.site == 'santehrai') ? 'alias' : 'alias';
                let second_link = (req.query.site == 'santehrai') ? 'alias' : 'alias';
                let main_product_link = (req.query.site == 'santehrai') ? 'https://example.com.ua/product/' : 'https://example.ua/';
                let second_product_link = (req.query.site == 'santehrai') ? 'https://example.ua/' : 'https://example.com.ua/product/';
                let result =rows;
                Parse.countBySite(req.query.site,filters).then(rows=> {

                        let total = rows[0].total;
                        let new_result = [];
                        let promises = [];
                        for(let i=0;i<result.length;i++){

                            new_result[i] = result[i];
                            new_result[i].main_product_title = '';
                            new_result[i].main_product_link = '';
                            new_result[i].main_product_price = '';
                            new_result[i].main_product_manufacturer = '';
                            new_result[i].second_product_title = '';
                            new_result[i].second_product_link = '';
                            new_result[i].second_product_price = '';
                            new_result[i].second_product_manufacturer = '';
                            if(result[i][main_id+'_product_id'] && result[i][main_id+'_product_id']!=='' && result[i][main_id+'_product_id']!==undefined){

                                promises.push(new Promise(function (resolve,reject) {
                                    main_site.getProductById(result[i][main_id+'_product_id']).then(main_row=>{

                                        if(filters.main_product_title &&filters.main_product_title!==undefined && main_row[0][main_name].indexOf(filters.main_product_title) < 0){
                                            return resolve(false);
                                        }
                                        if(filters.main_product_link &&filters.main_product_link!==undefined && (main_product_link+main_row[0][main_link]).indexOf(filters.main_product_link) < 0){
                                            return resolve(false);
                                        }
                                        new_result[i].main_product_title = main_row[0][main_name];
                                        new_result[i].main_product_price = main_row[0].price;
                                        new_result[i].main_product_link = main_product_link+main_row[0][main_link];
                                        new_result[i].main_product_manufacturer = main_row[0].manufacturer;
                                        second_site.getProductById(result[i][second_id+'_product_id']).then(second_row=>{

                                            new_result[i].second_product_title = second_row[0][second_name];
                                            new_result[i].second_product_price = second_row[0].price;
                                            new_result[i].second_product_link = second_product_link+second_row[0][second_link];
                                            new_result[i].second_product_manufacturer = main_row[0].manufacturer;
                                            return resolve(new_result[i]);
                                        }).catch(e=>{
                                            return resolve(new_result[i]);
                                        })
                                    }).catch(e=>{
                                        return resolve(false);
                                    })
                                }));
                            }else{

                                promises.push(new Promise(function (resolve,reject) {
                                    return resolve(false);
                                            })
                                );
                            }

                        }


                    /**
                     * Run loop with queries
                     */
                    Promise.all(promises)
                        .then(all_result => {
                            let all_result1 = all_result.filter(function(x) {
                                return x;
                            });
                            if(filters){
                                total = all_result1.length;
                            }


                            if(req.query.export){
                                // You can then return this straight
                                const mainspecification = specification(main_id, second_id);

                                const report = excel.buildExport(
                                    [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                                        {
                                            name: 'Report', // <- Specify sheet name (optional)
                                            specification: mainspecification, // <- Report specification
                                            data: all_result1 // <-- Report data
                                        }
                                    ]
                                );

                                fs.writeFile( path.join(__dirname, "../client/build/static/report.xlsx"), report, {encoding:'utf-8'}, function(err,result) {
                                    if(err) {
                                        return console.log(err);
                                    }
                                    res.json({'success':true, 'link':'/static/report.xlsx'})
                                });

                            }else{
                                res.json({'result':all_result1,'count' : total,'sites': parsed_sites})
                            }
                        })
                        .catch((e) => {
                            console.log(e);
                        });

                })

    });

});

router.get('/our',  passport.authenticate('jwt', { session: false }), function(req, res, next) {

    let filters = filterQuery(req.query);
    if(req.query.export){
        req.query.limit = 999999;
    }
    Parse.getListParseId(req.query.site)
        .then(rows => {

            let main_site = (req.query.site == 'santehrai') ? Santehrai : Stevian;
            let result =rows;
            let promises = [];
            let ids = [];
            result.forEach(function (value,index) {
                ids.push(value.id)
            });
            main_site.getMissingProductCount(ids).then(count=>{
                promises.push(new Promise(function (resolve,reject) {
                    main_site.getMissingProducts(ids, req.query.limit,req.query.page,filters).then(main_row=>{
                        return resolve(main_row);
                    }).catch(e=>{
                        return resolve(e);
                    });
                }));
                /**
                 * Run loop with queries
                 */
                Promise.all(promises)
                    .then(all_result => {

                        let total = count[0].total;
                        if(filters){
                            total = all_result[0].length;
                        }
                        if(req.query.export){
                            // You can then return this straight
                            const ourspecification = ourSpecification();

                            const report = excel.buildExport(
                                [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                                    {
                                        name: 'Report', // <- Specify sheet name (optional)
                                        specification: ourspecification, // <- Report specification
                                        data: all_result[0] // <-- Report data
                                    }
                                ]
                            );

                            fs.writeFile( path.join(__dirname, "../client/build/static/report.xlsx"), report, {encoding:'utf-8'}, function(err,result) {
                                if(err) {
                                    return console.log(err);
                                }
                                res.json({'success':true, 'link':'/static/report.xlsx'})
                            });

                        }else{
                            res.json({'result':all_result[0],'count' :total})
                        }
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            }).catch(e=>{
                console.log(e);
            });
        });

});


router.get('/their',  passport.authenticate('jwt', { session: false }), function(req, res, next) {

    let filters = filterQuery(req.query);

    if(req.query.export){
        req.query.limit = 999999;
    }
    Parse.countWithMissing(req.query.site )
        .then(count => {
            Parse.getListWithMissing(req.query.limit,req.query.page,req.query.site ,filters)
                .then(rows => {
                    let total = count[0].total;
                    if(filters){
                        total = rows.length;
                    }
                    if(req.query.export){
                        // You can then return this straight

                        const theirspecification = theirSpecification();

                        const report = excel.buildExport(
                            [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                                {
                                    name: 'Report', // <- Specify sheet name (optional)
                                    specification: theirspecification, // <- Report specification
                                    data: rows // <-- Report data
                                }
                            ]
                        );

                        fs.writeFile( path.join(__dirname, "../client/build/static/report.xlsx"), report, {encoding:'utf-8'}, function(err,result) {
                            if(err) {
                                return console.log(err);
                            }
                            res.json({'success':true, 'link':'/static/report.xlsx'})
                        });

                    }else{
                        res.json({'result':rows,'count' :total})
                    }
                })
                .catch(e=>{
                    console.log(e);
                });
        })
        .catch(e=>{
            console.log(e)
        });

});


router.get('/history/:id',  passport.authenticate('jwt', { session: false }), function(req, res, next) {


    Parse.getCountHistoryById(req.params.id )
        .then(count => {
            let total = count[0].total;
            Parse.getHistoryById(req.params.id,req.query.limit,req.query.page )
                .then(history => {
                    Parse.getParseById(req.params.id )
                        .then(parse => {
                            res.json({'history':history,'parse' :parse[0],'count' :(total+1)})
                        })
                        .catch(e=>{
                            console.log(e)
                            res.json({'error':e})
                        });
                })
                .catch(e=>{
                    console.log(e)
                    res.json({'error':e})
                });
        })
        .catch(e=>{
            console.log(e)
            res.json({'error':e})
        });



});

router.post('/start-parse',  passport.authenticate('jwt', { session: false }), function(req, res, next) {
     require('../parsers/index.js');
    res.json({'success':'Successfuly started'});
});


router.get('/count-stat',  passport.authenticate('jwt', { session: false }), function(req, res, next) {

    Parse.getParseStatDates()
        .then(dates => {
            let date_filter = req.query.date ? req.query.date : dates[0].date_created;
            Parse.getParseCountStat(date_filter)
                .then(rows => {
                    res.json({'result':rows, 'dates': dates})
                })
                .catch(e=>{
                    console.log(e);
                    res.json({'error':e})
                });
        })
        .catch(e=>{
            console.log(e)
            res.json({'error':e})
        });




});

router.post('/set-priority',  passport.authenticate('jwt', { session: false }), function(req, res, next) {

    Parse.setPriority(req.body)
        .then(result=>{
            res.json({
                success: true,
                message: 'Success',
            });
        })
        .catch(err=>{
            console.log(err);
            res.status(500).json(err);
        });



});


module.exports = router;
