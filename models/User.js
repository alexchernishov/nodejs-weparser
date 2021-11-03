var db=require('../dbconnection'); //reference of dbconnection.js
var User={

    getAllUsers:function(callback){

        return db.query("Select * from users",callback);

    },
    getUserById:function(id,callback){
        return db.query("select * from users where id=?",[id],callback);
    },
    getByEmail:function(email,callback){
        return db.query("select * from users where email=?",[email],callback);
    },
    getUserByName:function(username,callback){
        return db.query("select * from users where username=?",[username],callback);
    },
    deleteUser:function(id,callback){
        return db.query("delete from users where id=?",[id],callback);
    }
};
module.exports=User;