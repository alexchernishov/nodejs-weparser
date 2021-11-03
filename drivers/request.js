const Request = require('request');

const Proxies=require('../models/Proxies');
const cloudscraper = require('./cloudscrapper');


function requestXray(opts) {
    const optionsGlobal = opts;
    if (typeof opts === "function") {
        var request = opts
    } else {
        var request = Request.defaults(opts)
    }


    return function driver(context, callback) {
        let url = context.url;
        Proxies.list(function (err,res) {
            let proxy = res[Math.floor(Math.random()*res.length)];
            let host = proxy.host;
            let user = proxy.user;
            let password = proxy.password;
            let portHttp = proxy.http_port;
            let portHttps = proxy.https_port;

            let httpProxyUrl = "http://" + user + ":" + password + "@" + host + ":" + portHttp;
            let httpsProxyUrl = "http://" + user + ":" + password + "@" + host + ":" + portHttps;
            if(optionsGlobal.proxy == true){
                cloudscraper.request({
                    method: 'GET',
                    'url':url,
                    'proxy':httpProxyUrl,
                    'https-proxy':httpsProxyUrl,
                },
                function(err, response, body) {

                    console.log('connected request proxy: '+ proxy.host);
                    if(err){
                        console.log(err);
                        optionsGlobal.proxy = false;
                        requestXray(optionsGlobal)
                    }
                    return callback(err, body)
                })
            }else{
                cloudscraper.request({
                    method: 'GET',
                    'url':url,
                }, function(err, response, body) {
                    return callback(err, body)
                })
            }

        });


    }
}

module.exports = requestXray;