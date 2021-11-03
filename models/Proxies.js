let db=require('../dbconnection'); //reference of dbconnection.js

let Proxies={


    list:function(callback){

        return db.query("Select * from proxies",callback);

    },

};
module.exports=Proxies;