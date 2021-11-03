
const parsed_sites = require( "../parsers/sites-map");
const headerStyle1 =  {fill: {
    fgColor: {
        rgb: 'FF000000'
    }
}};// <- Header style


const theirSpecification =  function () {




    let result = {
        title: { // <- the key should match the actual data key
            displayName: 'Главный заголовок', // <- Here you specify the column header
            headerStyle: headerStyle1,
            width: 120 // <- width in pixels
        },
        identificator: { // <- the key should match the actual data key
            displayName: 'Идентификатор (артикул)', // <- Here you specify the column header
            headerStyle: headerStyle1,
            width: 120 // <- width in pixels
        },
        price: {
            displayName: 'Цена',
            headerStyle: headerStyle1,
            width: 220 // <- width in pixels
        },
    };
    return result;
};

module.exports=theirSpecification;