const filterQuery = (query) => {

    let filters = {};
    let empty = false;
    for (let k in query){
        if (query.hasOwnProperty(k)) {
            if(k.indexOf('filter_') !== -1){
                filters[k.replace('filter_','')] = query[k];
                empty = true;
            }
        }

    }
    if(!empty){
        return false;
    }
    return filters;
}
module.exports = filterQuery;