import React, { Component } from 'react';
import axios from "axios/index";

class Home extends Component {

    state = {dbinfo: [],
        successMessage:false,}

    componentDidMount() {

        axios.get('/users', )
            .then(res => {
                let dbinfo = res.data;
                this.setState({ dbinfo })
            })
            .catch(err => {
                console.log(err);
            });
    }

    startParsing(e){
        e.preventDefault();
        axios.post('parse_results/start-parse', )
            .then(res => {
                if(res.data && res.data.success){
                    this.setState({successMessage: true});
                    setTimeout(function () {
                        this.setState({successMessage: false});
                    }.bind(this),3000)
                }
            })
            .catch(err => {
                if (err.response) {
                    if(err.response.status === 401){
                        window.location.href = '/login'
                    }
                }
            });
    }

  render() {

    return (


              <div id="content-wrapper">

                  <div className="container-fluid">


                      <div className="card mb-3">

                          <div className="card-body">
                              <div className="table-responsive">
                                  <h2>
                                      Главная {
                                      this.state.dbinfo.map(dbinfo =>

                                          <b key={dbinfo.id}>
                                              {dbinfo.username}
                                          </b>
                                      )}
                                  </h2>
                              </div>
                          </div>
                      </div>
                      { this.state.successMessage ? <div className="alert alert-success hide">
                          Парсинг запущен!
                      </div> : ''
                      }
                      <button onClick={e=>this.startParsing(e)} className={"btn btn-success"}>Manual parsing</button>


                  </div>



              </div>



    );
  }
}

export default Home;
