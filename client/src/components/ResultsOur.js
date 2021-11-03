import React, { Component } from 'react';
import axios from "axios/index";
import Pagination from "react-js-pagination";
import {connect} from "react-redux";

import PropTypes from 'prop-types';
import exportTable from "../functions/exportTable";

class ResultsOur extends Component {

    state = {
        dbinfo: [],
        activePage: 1,
        limit: 10,
        total:30,
        page:'stevian',
        filter: {

        },
        filterEnabled : true,
        exportDisabled : false,
    };

    componentDidMount() {
        this.setState({page: this.props.domain.site});
       this.getResults();
    }
    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.domain.site !== prevProps.domain.site) {
            this.getResults();
        }
    }
    // NEW WAY
    static getDerivedStateFromProps(nextProps, prevState){

        return {
            page : nextProps.domain.site
        };
    }
    handlePageChange(pageNumber) {
        console.log(`active page is ${pageNumber}`);
        this.setState({activePage: pageNumber});

        this.getResults(pageNumber);
    }


    getResults(pageNumber){



        let stateFilter = this.state.filter;

        let urlParameters = Object.entries(stateFilter)
            .filter(function(x) {
                return (x[1] && x[1] !=='' && x[1]!== undefined);
            })
            .map(e => {
                if(e[1] &&e[1] !==''){
                    return encodeURI(e.join('='));
                }
                return '';
            });
        if(urlParameters.length>1){
            urlParameters=urlParameters.join('&');
        }else{
            urlParameters=urlParameters.join('');
        }
        if(urlParameters && urlParameters !==''){
            urlParameters='&'+ urlParameters;
        }

        pageNumber = pageNumber ? pageNumber : this.state.activePage;
        axios.get('/parse_results/our?site='+this.state.page+'&limit='+this.state.limit+'&page='+pageNumber+urlParameters, )
            .then(res => {
                let dbinfo = res.data.result;
                let total = res.data.count;
                this.setState({filterEnabled:true});
                this.setState({ dbinfo });
                this.setState({ total })
            })
            .catch(err => {
                console.log(err);
                let dbinfo = [];
                let total = [];
                this.setState({filterEnabled:true});
                this.setState({ dbinfo })
                this.setState({ total })
                if (err.response) {
                    if(err.response.status === 401){
                        window.location.href = '/login'
                    }
                }
            });
    }

    handleFilterChange(e){
        let filter = {...this.state.filter};
        filter[e.target.name] = e.target.value;
        this.setState({filterEnabled:false});
        this.setState({filter}, function () {
            this.getResults();
        });
    }


  render() {
    return (
              <div id="content-wrapper">
                  <div className="container-fluid">


                      <div className="card mb-3">
                          <div className="card-header">
                              <i className="fa fa-table"></i>
                              Продукты не найденые на сайтах конкурентов
                          </div>
                          <div className="card-body">


                              <div className="table-responsive">
                                  <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                      <thead>
                                      <tr>
                                          <th>Главный заголовок</th>
                                          <th>Идентификатор(артикул)</th>
                                          <th>Цена</th>
                                      </tr>
                                      </thead>
                                      <tbody>
                                      <tr className={'filters'}>
                                          <td><input type="text" disabled={!this.state.filterEnabled} onChange={this.handleFilterChange.bind(this)} className="form-control" value={this.state.filter.filter_label} name={'filter_label'}/></td>
                                          <td><input type="text" disabled={!this.state.filterEnabled} onChange={this.handleFilterChange.bind(this)} className="form-control" value={this.state.filter.filter_sku} name={'filter_sku'}/></td>
                                          <td></td>
                                      </tr>
                                      {this.state.dbinfo.length>0 ?
                                      this.state.dbinfo.map((dbinfo,index) =>
                                          <tr key={index}>
                                          <td><a href={'https://'+this.state.page+'.com.ua/'+dbinfo.alias} target="_blank" rel="nofollow">{dbinfo.label}</a></td>
                                          <td>{dbinfo.sku}</td>
                                          <td>{dbinfo.price}</td>
                                          </tr>
                                      )

                                          : <tr ><td  colSpan={3}><div className="loader"></div></td></tr>}
                                      </tbody>
                                  </table>
                                  <nav>
                                      <Pagination
                                          activePage={this.state.activePage}
                                          itemsCountPerPage={this.state.limit}
                                          totalItemsCount={this.state.total}
                                          pageRangeDisplayed={20}
                                          itemClass={'page-item'}
                                          linkClass={'page-link'}
                                          onChange={this.handlePageChange.bind(this)}
                                      />
                                  </nav>
                                  <button id="exportStart"  onClick={e=>exportTable(e,'/parse_results/our?site='+this.state.page)} className={"btn btn-success"}><i class="fa fa-file-excel-o fa-3x" aria-hidden="true"></i></button>
                                  <a  id="downloadExport" download={true}  className={"d-none"}>Export</a>
                              </div>

                          </div>
                      </div>
                  </div>
              </div>



    );
  }
}



ResultsOur.propTypes = {
    domain: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    domain:state.domain
})

export default connect(mapStateToProps)(ResultsOur);