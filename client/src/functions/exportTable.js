import axios from "axios/index";

const exportTable = function(e, link){
    e.preventDefault();
    document.getElementById("exportStart").disabled=true;
    axios.get(link+'&export=true', )
        .then(res => {
            document.getElementById("downloadExport").href=res.data.link;
            document.getElementById("downloadExport").click();
            document.getElementById("exportStart").disabled=false;
        })
        .catch(err => {
            if (err.response) {
                if(err.response.status === 401){
                    window.location.href = '/login'
                }
            }
        });
}

export default exportTable;