const db=require('../dbconnection'); //reference of dbconnection.js
const Query  = require('./Query');
const path = require('path');
const parsed_sites = require( "../parsers/sites-map");
require('dotenv').config();//instatiate environment variables



class Parse extends Query{
    constructor( config ) {
        super();
        this.connection = db;
    }


    all(limit, page){
        limit = limit ? limit : 10;
        page = page ? page : 1;
        return this.query("Select * from parse_results limit "+limit+" offset "+(page-1)*limit+"");

    }

    getListBySite(limit, page, site,filters){
        limit = limit ? limit : 10;
        page = page ? page : 1;

        let site_column = (site=='santehrai') ? 'santehrai_product_id' : 'stevian_product_id';
        let site2_column = (site=='santehrai') ? 'stevian_product_id' : 'santehrai_product_id';
        let limitOffset = '';
        if((!filters.main_product_title || filters.main_product_title===undefined || filters.main_product_title=='') &&
            (!filters.identificator || filters.identificator===undefined || filters.identificator=='')){
            limitOffset = " limit "+limit+" offset "+(page-1)*limit+ "  ";
        }

        let query = "SELECT DISTINCT identificator , id, "+site_column+","+site2_column+", ";


        for(let k=0;k<parsed_sites.length;k++){
            if((k+1)==parsed_sites.length){
                query+= " link_"+parsed_sites[k].name+",price_"+parsed_sites[k].name+" ";
            }else{
                query+= " link_"+parsed_sites[k].name+",price_"+parsed_sites[k].name+" , ";
            }
        }
        query+= " , priority FROM ( ";
        for(let i=0;i<parsed_sites.length;i++){

            let join_query = '';
            let join_columns = '';
            for(let j=0;j<parsed_sites.length;j++){
                if(j !==i){
                    join_query += " LEFT JOIN `parse_results` "+parsed_sites[j].name+" ON("+parsed_sites[i].name+"."+site_column+" = "+parsed_sites[j].name+"."+site_column+") AND "+parsed_sites[j].name+".link LIKE '"+parsed_sites[j].link+"%' " ;

                }
                if((j+1)==parsed_sites.length){
                    join_columns+= " "+parsed_sites[j].name+".`link` as link_"+parsed_sites[j].name+", "+parsed_sites[j].name+".`price` as price_"+parsed_sites[j].name+" ";
                }else{
                    join_columns+= " "+parsed_sites[j].name+".`link` as link_"+parsed_sites[j].name+", "+parsed_sites[j].name+".`price` as price_"+parsed_sites[j].name+", ";
                }

            }


            if((i+1)==parsed_sites.length){
                query+= "(SELECT  "+parsed_sites[i].name+".id, "+parsed_sites[i].name+".`"+site_column+"`,"+parsed_sites[i].name+".`"+site2_column+"`, "+parsed_sites[i].name+".`identificator`, "+join_columns+" " +
                    " ,"+parsed_sites[i].name+".`priority` FROM `parse_results` "+parsed_sites[i].name+" " +
                    join_query +
                "where "+parsed_sites[i].name+".`"+site_column+"` IS NOT NULL AND "+parsed_sites[i].name+".link LIKE '"+parsed_sites[i].link+"%' "+
                    // limitOffset+
                    ") " +
                    "";
            }else{
                query+= "(SELECT  "+parsed_sites[i].name+".id as id , "+parsed_sites[i].name+".`"+site_column+"` as "+site_column+" ,"+parsed_sites[i].name+".`"+site2_column+"` as "+site2_column+", "+parsed_sites[i].name+".`identificator` as identificator, "+join_columns+"" +
                    " ,"+parsed_sites[i].name+".`priority` FROM `parse_results` "+parsed_sites[i].name+" " +
                join_query +
                    "where "+parsed_sites[i].name+".`"+site_column+"` IS NOT NULL AND "+parsed_sites[i].name+".link LIKE '"+parsed_sites[i].link+"%' "+
                    // limitOffset+
                    ") " +
                    "UNION  ";
            }

        }

            query = query +  ") as result";
            query = query +  " WHERE 1=1 ";

            if(filters.identificator  && filters.identificator!==undefined && filters.identificator!==''){
                query = query +  " AND identificator LIKE '%"+filters.identificator+"%'";
            }
            query = query +  " ORDER BY priority DESC ";
            query = query +  " "+limitOffset+" ";
        // console.log(query);
            return this.query(query);
    }

    getListParseId( site, filters){
        let site_column = (site=='santehrai') ? 'santehrai_product_id' : 'stevian_product_id';

        let query = "SELECT "+site_column+" as id " +
            "FROM `parse_results` WHERE   "+site_column+" IS NOT NULL";
        return this.query(query );

    }

    getListWithMissing(limit, page, site,filters){
        limit = limit ? limit : 10;
        page = page ? page : 1;
        let site_column = (site=='santehrai') ? 'santehrai_product_id' : 'stevian_product_id';
        let query = "SELECT title, identificator, price, link " +
            "FROM `parse_results` WHERE   "+site_column+" IS NULL ";

        if(filters.identificator  && filters.identificator!==undefined && filters.identificator!==''){
            query = query +  " AND identificator LIKE '%"+filters.identificator+"%' ";
        }

        if(filters.title  && filters.title!==undefined && filters.title!==''){
            query = query +  " AND title LIKE '%"+filters.title+"%' ";
        }

        query = query + "limit "+limit+" offset "+(page-1)*limit;
        return this.query(query);
    }

    countWithMissing(site){
        let site_column = (site=='santehrai') ? 'santehrai_product_id' : 'stevian_product_id';
        return this.query("SELECT count(*) as total " +
            "FROM `parse_results` WHERE   "+site_column+" IS NULL" );
    }

    count(){
        return this.query("Select count(*) as total  from parse_results");
    }
    countBySite(site,filters){


        let site_column = (site=='santehrai') ? 'santehrai_product_id' : 'stevian_product_id';
        let site2_column = (site=='santehrai') ? 'stevian_product_id' : 'santehrai_product_id';


        let query = "SELECT count(*) as total ";

        query+= " FROM ( ";
        for(let i=0;i<parsed_sites.length;i++){

            let join_query = '';
            let join_columns = '';
            for(let j=0;j<parsed_sites.length;j++){
                if(j !==i){
                    join_query += " LEFT JOIN `parse_results` "+parsed_sites[j].name+" ON("+parsed_sites[i].name+"."+site_column+" = "+parsed_sites[j].name+"."+site_column+") AND "+parsed_sites[j].name+".link LIKE '"+parsed_sites[j].link+"%' " ;

                }
                if((j+1)==parsed_sites.length){
                    join_columns+= " "+parsed_sites[j].name+".`link` as link_"+parsed_sites[j].name+", "+parsed_sites[j].name+".`price` as price_"+parsed_sites[j].name+" ";
                }else{
                    join_columns+= " "+parsed_sites[j].name+".`link` as link_"+parsed_sites[j].name+", "+parsed_sites[j].name+".`price` as price_"+parsed_sites[j].name+", ";
                }

            }


            if((i+1)==parsed_sites.length){
                query+= "(SELECT  "+parsed_sites[i].name+".id, "+parsed_sites[i].name+".`"+site_column+"`,"+parsed_sites[i].name+".`"+site2_column+"`, "+parsed_sites[i].name+".`identificator`, "+join_columns+" " +
                    "FROM `parse_results` "+parsed_sites[i].name+" " +
                    join_query +
                    "where "+parsed_sites[i].name+".`"+site_column+"` IS NOT NULL AND "+parsed_sites[i].name+".link LIKE '"+parsed_sites[i].link+"%' ) " +
                    "";
            }else{
                query+= "(SELECT  "+parsed_sites[i].name+".id as id , "+parsed_sites[i].name+".`"+site_column+"` as "+site_column+" ,"+parsed_sites[i].name+".`"+site2_column+"` as "+site2_column+", "+parsed_sites[i].name+".`identificator` as identificator, "+join_columns+"" +
                    "FROM `parse_results` "+parsed_sites[i].name+" " +
                    join_query +
                    "where "+parsed_sites[i].name+".`"+site_column+"` IS NOT NULL AND "+parsed_sites[i].name+".link LIKE '"+parsed_sites[i].link+"%' ) " +
                    "UNION  ";
            }

        }

        query = query +  ") as result";
        query = query +  " WHERE 1=1 ";
        return this.query(query);
    }


    getHistoryById(id,limit, page){
        return this.query("(Select price, created_at  from parse_results where id=?) " +
            "UNION (Select price, created_at  from parse_history where parse_id=?)  limit "+limit+" offset "+(page-1)*limit+"",[id,id]);
    }


    getCountHistoryById(id){
        return this.query("Select count(*) as total  from parse_history where id=? ",[id]);
    }

    getParseById(id){
        return this.query("Select * from parse_results  where id=? limit 1",[id]);
    }


    getParseCountStat(date){

        let query = "SELECT * FROM ((SELECT count(id) as total, CONCAT(SUBSTRING_INDEX(`link`, '.ua/', 1),'.ua')  as link_group,SUBSTRING_INDEX(`created_at`, ' ', 1)  as date_created  FROM parse_results " +
            " GROUP BY link_group,date_created) " +
            " UNION ALL " +

            "(SELECT count(ph.id) as total, CONCAT(SUBSTRING_INDEX(pr.`link`, '.ua/', 1),'.ua') as link_group, SUBSTRING_INDEX(ph.`created_at`, ' ', 1)  as date_created FROM parse_history ph INNER JOIN parse_results pr on (ph.parse_id=pr.id) " +
            " GROUP BY link_group,date_created)) as result ";


        if(date && date !==null){
            query+= "WHERE `date_created` LIKE '"+date+"'" ;
        }
        query+="ORDER BY `date_created`  DESC";
        return this.query(query);
   }

    getParseStatDates(){

        let query = "(SELECT SUBSTRING_INDEX(`created_at`, ' ', 1) as date_created FROM parse_results GROUP BY date_created) UNION (SELECT SUBSTRING_INDEX(pr.`created_at`, ' ', 1) as date_created FROM parse_history ph INNER JOIN parse_results pr on (ph.parse_id=pr.id) GROUP BY date_created) ORDER BY date_created DESC";

        return this.query(query);
   }


    setPriority(data){
        let priority  = data.priority ? 1 : 0;
        return this.query("UPDATE parse_results SET priority=? WHERE id=?   ", [priority,data.id]);
    }

}


module.exports=Parse;