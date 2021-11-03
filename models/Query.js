const mysql=require('mysql');

class Query {
    constructor( config ) {
        this.connection = mysql.createPool({

            host:'localhost',
            user:'root',
            password:'',
            database:'santehrai'

        });
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
          return  this.connection.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.connection.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }

}



module.exports=Query;