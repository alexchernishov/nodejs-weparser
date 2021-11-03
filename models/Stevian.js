const Query  = require('./Query');
const mysql=require('mysql');
require('dotenv').config();//instatiate environment variables


class Stevian extends Query{
    constructor( config ) {
        super();
        this.connection = mysql.createPool({

            host:process.env.DB_HOST,
            user:process.env.DB_USER,
            password:process.env.DB_PASSWORD,
            database:process.env.STEVIAN_DB_NAME,
            timezone: process.env.TIMEZONE

        });
    }
    getProductById(id){

        return this.query("SELECT \n" +
            "    at_link.value as alias, \n" +
            "    IF(at_name.value_id > 0, at_name.value, at_name_default.value) AS `label`,\n" +
            "at_price.value as price, " +
            " at_manufacturer.value as manufacturer " +
            "\n" +
            "FROM \n" +
            "   `catalog_product_entity` AS `e` \n" +
            "    INNER JOIN \n" +
            "         `catalog_product_entity_varchar` AS `at_name_default` \n" +
            "               ON (`at_name_default`.`entity_id` = `e`.`entity_id`) AND \n" +
            "                  (`at_name_default`.`attribute_id` = (SELECT attribute_id FROM `eav_attribute` ea LEFT JOIN `eav_entity_type` et ON ea.entity_type_id = et.entity_type_id  WHERE `ea`.`attribute_code` = 'name' AND et.entity_type_code = 'catalog_product')) AND \n" +
            "                  `at_name_default`.`store_id` = 0 \n" +
            "    LEFT JOIN \n" +
            "          `catalog_product_entity_varchar` AS `at_name` \n" +
            "               ON (`at_name`.`entity_id` = `e`.`entity_id`) AND \n" +
            "                  (`at_name`.`attribute_id` = (SELECT attribute_id FROM `eav_attribute` ea LEFT JOIN `eav_entity_type` et ON ea.entity_type_id = et.entity_type_id  WHERE `ea`.`attribute_code` = 'name' AND et.entity_type_code = 'catalog_product')) \n" +
            "                  AND \n" +
            "                  (`at_name`.`store_id` = 1)\n" +
            "                  \n" +
            "    LEFT JOIN \n" +
            "          `eav_attribute_option_value` AS `at_manufacturer` \n" +
            "               ON (`at_manufacturer`.`option_id` = (SELECT value as option_id FROM `catalog_product_index_eav` cpie  WHERE `cpie`.`entity_id` = `e`.`entity_id` AND `cpie`.`attribute_id` = \n" +
            "                                                   (SELECT attribute_id FROM `eav_attribute` ea LEFT JOIN `eav_entity_type` et ON ea.entity_type_id = et.entity_type_id  WHERE `ea`.`attribute_code` = 'manufacturer' AND et.entity_type_code = 'catalog_product')\n" +
            "                                                   ))" +
            "    LEFT JOIN \n" +
            "          `catalog_product_entity_varchar` AS `at_link` \n" +
            "               ON (`at_link`.`entity_id` = `e`.`entity_id`) AND \n" +
            "                  (`at_link`.`attribute_id` = (SELECT attribute_id FROM `eav_attribute` ea LEFT JOIN `eav_entity_type` et ON ea.entity_type_id = et.entity_type_id  WHERE `ea`.`attribute_code` = 'url_path' AND et.entity_type_code = 'catalog_product'  LIMIT 1)) " +
            "    LEFT JOIN\n" +
            "`catalog_product_entity_decimal` AS `at_price`\n" +
            "    ON (`at_price`.`entity_id` = `e`.`entity_id`) AND\n" +
            "    (`at_price`.`attribute_id` = (SELECT attribute_id FROM `eav_attribute` ea LEFT JOIN `eav_entity_type` et ON ea.entity_type_id = et.entity_type_id  WHERE `ea`.`attribute_code` = 'price'  LIMIT 1))" +
            "where e.entity_id = ? limit 1",[id]);
    }


    getMissingProducts(ids, limit,page,filters){
        limit = limit ? limit : 10;
        page = page ? page : 1;
        let query =  "SELECT \n" +
            "  DISTINCT(e.entity_id), e.sku, \n" +
            "    IF(at_name.value_id > 0, at_name.value, at_name_default.value) AS `label`,\n" +
            "at_price.value as price, " +
            " at_manufacturer.value as manufacturer, " +
            "at_link.value as alias" +
            "\n" +
            "FROM \n" +
            "   `catalog_product_entity` AS `e` \n" +
            "    INNER JOIN \n" +
            "         `catalog_product_entity_varchar` AS `at_name_default` \n" +
            "               ON (`at_name_default`.`entity_id` = `e`.`entity_id`) AND \n" +
            "                  (`at_name_default`.`attribute_id` = (SELECT attribute_id FROM `eav_attribute` ea LEFT JOIN `eav_entity_type` et ON ea.entity_type_id = et.entity_type_id  WHERE `ea`.`attribute_code` = 'name' AND et.entity_type_code = 'catalog_product')) AND \n" +
            "                  `at_name_default`.`store_id` = 0 \n" +
            "    LEFT JOIN \n" +
            "          `catalog_product_entity_varchar` AS `at_name` \n" +
            "               ON (`at_name`.`entity_id` = `e`.`entity_id`) AND \n" +
            "                  (`at_name`.`attribute_id` = (SELECT attribute_id FROM `eav_attribute` ea LEFT JOIN `eav_entity_type` et ON ea.entity_type_id = et.entity_type_id  WHERE `ea`.`attribute_code` = 'name' AND et.entity_type_code = 'catalog_product')) \n" +
            "                  AND \n" +
            "                  (`at_name`.`store_id` = 1)\n" +
            "                  \n" +
            "    LEFT JOIN \n" +
            "          `eav_attribute_option_value` AS `at_manufacturer` \n" +
            "               ON (`at_manufacturer`.`option_id` = (SELECT value as option_id FROM `catalog_product_index_eav` cpie  WHERE `cpie`.`entity_id` = `e`.`entity_id` AND `cpie`.`attribute_id` = \n" +
            "                                                   (SELECT attribute_id FROM `eav_attribute` ea LEFT JOIN `eav_entity_type` et ON ea.entity_type_id = et.entity_type_id  WHERE `ea`.`attribute_code` = 'manufacturer' AND et.entity_type_code = 'catalog_product')\n" +
            "                                                   ))" +
            "    LEFT JOIN \n" +
            "          `catalog_product_entity_varchar` AS `at_link` \n" +
            "               ON (`at_link`.`entity_id` = `e`.`entity_id`) AND \n" +
            "                  (`at_link`.`attribute_id` = (SELECT attribute_id FROM `eav_attribute` ea LEFT JOIN `eav_entity_type` et ON ea.entity_type_id = et.entity_type_id  WHERE `ea`.`attribute_code` = 'url_path' AND et.entity_type_code = 'catalog_product'  LIMIT 1)) " +
            "    LEFT JOIN\n" +
            "`catalog_product_entity_decimal` AS `at_price`\n" +
            "    ON (`at_price`.`entity_id` = `e`.`entity_id`) AND\n" +
            "    (`at_price`.`attribute_id` = (SELECT attribute_id FROM `eav_attribute` ea LEFT JOIN `eav_entity_type` et ON ea.entity_type_id = et.entity_type_id  WHERE `ea`.`attribute_code` = 'price'  LIMIT 1))" +
            "where e.entity_id NOT IN (?) ";


        if(filters.sku  && filters.sku!==undefined && filters.sku!==''){
            query = query +  " AND e.sku  LIKE '%"+filters.sku+"%'";
        }
        if(filters.label  && filters.label!==undefined && filters.label!==''){
            query = query +  " AND IF(at_name.value_id > 0, at_name.value, at_name_default.value)  LIKE '%"+filters.label+"%'";
        }
        query = query +  " limit "+limit+" offset "+(page-1)*limit+ "  ";

        return this.query(query,[ids]);
    }

    getMissingProductCount(ids){

        return this.query("SELECT \n" +
            "  count(*) as total "+
            "FROM \n" +
            "   `catalog_product_entity` AS `e` \n" +
           "where e.entity_id NOT IN (?) ",[ids]);
    }

    getProductBySku(sku){
        return this.query("Select e.entity_id, e.sku,at_price.value as price from catalog_product_entity e" +
            "    LEFT JOIN\n" +
            "`catalog_product_entity_decimal` AS `at_price`\n" +
            "    ON (`at_price`.`entity_id` = `e`.`entity_id`) AND\n" +
            "    (`at_price`.`attribute_id` = (SELECT attribute_id FROM `eav_attribute` ea LEFT JOIN `eav_entity_type` et ON ea.entity_type_id = et.entity_type_id  WHERE `ea`.`attribute_code` = 'price'  LIMIT 1))" +
            "" +
            " where e.sku LIKE ? limit 1",[sku]);
    }

}

module.exports=Stevian;

    