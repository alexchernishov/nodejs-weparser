const db=require('../dbconnection'); //reference of dbconnection.js
const Query  = require('./Query');

class SkuMapping extends Query{
    constructor( config ) {
        super();
        this.connection = db;
    }


    all(limit, page){
        limit = limit ? limit : 10;
        page = page ? page : 1;
        return this.query("Select * from sku_mapping  order By id DESC limit "+limit+" offset "+(page-1)*limit+"");

    }


    count(){
        return this.query("Select count(*) as total  from sku_mapping");
    }

    add(data){
        return this.query("Insert into sku_mapping (current_sku, real_sku, site) values (?,?,?)", [data.currentSku,data.realSku, data.site]);
    }


    getSku(sku,site){
        return this.query("Select * from sku_mapping WHERE real_sku = ? AND site LIKE ? LIMIT 1", [sku,site]);
    }

    change(data){
        let priority  = data.priority ? 1 : 0;
        return this.query("UPDATE sku_mapping SET ??=? WHERE id=?   ", [data.name,data.value,data.id]);
    }
    delete(data){
        let priority  = data.priority ? 1 : 0;
        return this.query("DELETE from sku_mapping  WHERE id=?   ", [data.id]);
    }
}


module.exports=SkuMapping;