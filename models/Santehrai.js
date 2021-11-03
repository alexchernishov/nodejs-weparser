let Query  = require('./Query');
require('dotenv').config();//instatiate environment variables


const mysql=require('mysql');

class Santehrai extends Query{
    constructor( config ) {
        super();
        this.connection = mysql.createPool({
            host:process.env.SANTEHRAI_DB_HOST,
            user:process.env.SANTEHRAI_DB_USER,
            password:process.env.SANTEHRAI_DB_PASSWORD,
            database:process.env.SANTEHRAI_DB_NAME,
            timezone: process.env.SANTEHRAI_TIMEZONE
        });
    }
    getProductById(id){
        return this.query("Select p.label, p.alias, b.label as manufacturer,  IF(p.currency_id > 0, p.price*c.exchange_rate, p.price) as price from product p LEFT JOIN currency c ON p.currency_id = c.id LEFT JOIN brand b ON p.brand_id = b.id  where p.id=? limit 1",[id]);
    }
    getProductBySku(sku){
        return this.query("Select id, vendor_number from product where vendor_number LIKE ? limit 1",[sku]);
    }
    getMissingProducts(ids, limit,page,filters){
        limit = limit ? limit : 10;
        page = page ? page : 1;
        let query = "Select p.label, p.vendor_number as sku, CONCAT('product/', p.alias) as alias, (p.price*c.exchange_rate) as price, b.label as manufacturer from product p LEFT JOIN currency c ON p.currency_id = c.id  LEFT JOIN brand b ON p.brand_id = b.id where p.id NOT IN (?) ";
        if(filters.sku  && filters.sku!==undefined && filters.sku!==''){
            query = query +  " AND  p.vendor_number  LIKE '%"+filters.sku+"%'";
        }
        if(filters.label  && filters.label!==undefined && filters.label!==''){
            query = query +  " AND p.label  LIKE '%"+filters.label+"%'";
        }
        query = query +  " limit "+limit+" offset "+(page-1)*limit+ "  ";
        return this.query(query,[ids]);
    }
    getMissingProductCount(ids){
        console.log(ids);
        return this.query("Select count(*) as total from product where id NOT IN (?)",[ids]);
    }
}


module.exports=Santehrai;