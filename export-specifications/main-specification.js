
const parsed_sites = require( "../parsers/sites-map");
const headerStyle1 =  {fill: {
    fgColor: {
        rgb: 'FF000000'
    }
}};// <- Header style


const specification =  function (main_id, second_id) {




    let result1 = {
        main_product_title: { // <- the key should match the actual data key
            displayName: 'Главный заголовок', // <- Here you specify the column header
            headerStyle: headerStyle1,// <- Header style
            width: 120 // <- width in pixels
        },
        identificator: { // <- the key should match the actual data key
            displayName: 'Идентификатор (артикул)', // <- Here you specify the column header
            headerStyle: headerStyle1,
            width: 120 // <- width in pixels
        },
        main_product_link: {
            displayName: 'Ссылка',
            headerStyle: headerStyle1,
            width: 220 // <- width in pixels
        },
    };
    for (let i =0; i<parsed_sites.length;i++){
        result1['link_'+parsed_sites[i].name] = { // <- the key should match the actual data key
            displayName: 'Ссылка '+parsed_sites[i].name, // <- Here you specify the column header
            headerStyle: headerStyle1,
            width: 120 // <- width in pixels

        };
    }


    let result2={

        main_product_price: {
            displayName: 'Цена ' + main_id,
            headerStyle: headerStyle1,
            width: '10', // <- width in chars (when the number is passed as string)

        },
        second_product_price: {
            displayName: 'Цена ' + second_id,
            headerStyle: {
                fill: {
                    fgColor: {
                        rgb: 'FF000000'
                    }
                }
            }, // <- Header style
            width: 220, // <- width in pixels
            cellStyle: function(value, row) { // <- style renderer function
                // if the status is 1 then color in green else color in red
                // Notice how we use another cell value to style the current one
                return (row['main_product_price']>row['second_product_price']) ?  {font:{color: {rgb: 'FFFF0000'}}} : (row['main_product_price']<row['second_product_price']) ?  {font:{color: {rgb: '008000'}}} : {font:{color: {rgb: '0000FF'}}}; // <- Inline cell style is possible
            },
        },


    };

    let merged1 = Object.assign(result1, result2);
    for (let i =0; i<parsed_sites.length;i++){
        merged1['price_'+parsed_sites[i].name] = { // <- the key should match the actual data key
            displayName: 'Цена '+parsed_sites[i].name, // <- Here you specify the column header
            headerStyle: headerStyle1,
            width: 120, // <- width in pixels,
            cellStyle: function(value, row) { // <- style renderer function
                // if the status is 1 then color in green else color in red
                // Notice how we use another cell value to style the current one
                return (row['main_product_price']>row['price_'+parsed_sites[i].name]) ?  {font:{color: {rgb: 'FFFF0000'}}} : (row['main_product_price']<row['price_'+parsed_sites[i].name]) ?  {font:{color: {rgb: '008000'}}} : {font:{color: {rgb: '0000FF'}}}; // <- Inline cell style is possible
            },
        };
    }
    let result3 = {
        main_product_manufacturer: {
            displayName: 'Производитель ' + main_id,
            headerStyle: headerStyle1,
            width: '10' // <- width in chars (when the number is passed as string)
        },
        second_product_manufacturer: {
            displayName: 'Производитель ' + second_id,
            headerStyle: headerStyle1,
            width: 220 // <- width in pixels
        },
    };

    let result = Object.assign(merged1, result3);
    return result;
};

module.exports=specification;