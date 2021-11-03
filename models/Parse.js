const db=require('../dbconnection'); //reference of dbconnection.js

const Parse={


    add:function(Parse,callback){
       db.query("select * from parse_results where link=? limit 1 ",[Parse.link],function(err,rows){
            if(err){
                console.log(err);
                return err;
            }else{
                if(rows && rows.length>0){
                    let result = rows;
                    db.query("update parse_results  SET  price = ?, created_at = ? Where id = ? ",[Parse.price, Parse.created_at, result[0].id],function (err,rows) {
                        if(err){
                            console.log(err);
                        }
                        return db.query("Insert into parse_history (parse_id, price, created_at) values(?,?,?)",[result[0].id,result[0].price, result[0].created_at],callback);
                    });
                }else{
                    return db.query("Insert into parse_results (link, title, price,identificator, created_at, stevian_product_id, santehrai_product_id) values(?,?,?,?,?,?,?)",[Parse.link,Parse.title,Parse.price, Parse.identificator, Parse.created_at, Parse.stevian_product_id, Parse.santehrai_product_id ],callback);
                }
            }
        });


    },

    updateSantehraiById:function(id, santehrai_id,callback){
        db.query("update parse_results  set santehrai_product_id = ? where id=?",[santehrai_id, id],callback);

    },
    updateStevianById:function(id, stevian_id,callback){
        db.query("update parse_results  set stevian_product_id = ? where id=?",[stevian_id, id],callback);

    },
    list:function(callback){

        return db.query("Select * from parse_results",callback);

    },

};
module.exports=Parse;