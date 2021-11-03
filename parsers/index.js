require('process');
const db=require('../dbconnection'); //reference of dbconnection.js
const SantehraiDb=require('../models/Santehrai');
const Santehrai = new SantehraiDb();
const StevianDb=require('../models/Stevian');
const Stevian = new StevianDb();

const path = require('path');


let promisesGlobal = [];
let normalizedPath = path.join(__dirname, "sites");
require("fs").readdirSync(normalizedPath).forEach(function(file) {


       promisesGlobal.push( require("./sites/" + file));
});
//

    Promise.all(promisesGlobal)
    .then(globalResult => {
        console.log('Alll!!!!!!!!!!!!!!!');
        db.end();
        Santehrai.close();
        Stevian.close();
        process.exit();
    })
    .catch((e) => {
        console.log(e);
    });

