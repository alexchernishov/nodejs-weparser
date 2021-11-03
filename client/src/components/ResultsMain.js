import React, { Component } from 'react';
import axios from "axios/index";
import Pagination from "react-js-pagination";
import {connect} from "react-redux";
import {
    Link
} from 'react-router-dom';
import exportTable from '../functions/exportTable'

import PropTypes from 'prop-types';
import $ from 'jquery';
window.jQuery = $;
window.$ = $;
global.jQuery = $;


class ResultsMain extends Component {

    state = {
        dbinfo: [],
        sites:[],
        activePage: 1,
        limit: 10,
        total:30,
        page:'stevian',
        filter: {

        },
        filterEnabled : true,
        exportDisabled : false,
        successMessage:false,
        errorMessage:false
    };

    componentDidMount() {
        this.setState({page: this.props.domain.site});
       this.getResults();


            $(document).on('scroll','.table',function(e) { //detect a scroll event on the tbody

            });


    }

    componentDidUpdate(prevProps) {
        // Typical usage (don't forget to compare props):
        if (this.props.domain.site !== prevProps.domain.site) {
            this.getResults();
        }


    }

    static getDerivedStateFromProps(nextProps){

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
        let dbinfo = [];
        this.setState({ dbinfo });
        pageNumber = pageNumber ? pageNumber : this.state.activePage;

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


        axios.get('/parse_results?site='+this.state.page+'&limit='+this.state.limit+'&page='+pageNumber+urlParameters, )
            .then(res => {
                let dbinfo = res.data.result;
                let sites = res.data.sites;
                let total = res.data.count;
                this.setState({filterEnabled:true});
                this.setState({ dbinfo });
                this.setState({ sites });
                this.setState({ total })
            })
            .catch(err => {
                console.log(err);
                let dbinfo = [];
                let total = [];
                let sites = [];
                this.setState({ dbinfo });
                this.setState({ sites });
                this.setState({ total });
                this.setState({filterEnabled:true});
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

    checkBoxCheck(e, id){

        axios({
            method: 'post',
            url: '/parse_results/set-priority',
            data: {
                id : id,
                priority : e.target.checked,
            },
            config: { headers: { 'Content-Type': 'application/json' }}
        })
            .then(res => {
                if(res.data && res.data.success){
                    this.setState({successMessage: true});
                    // this.getResults();
                    setTimeout(function () {
                        this.setState({successMessage: false});
                    }.bind(this),3000)
                }
            })
            .catch(err => {
                if(err.response && err.response.data && err.response.data.sqlMessage){
                    this.setState({errorMessage: err.response.data.sqlMessage});
                    setTimeout(function () {
                        this.setState({errorMessage: false});
                    }.bind(this),3000)
                }
            })

    }

  render() {

      return (
              <div id="content-wrapper">
                  <div className="container-fluid">


                      <div className="card mb-3">
                          <div className="card-header">
                              <i className="fa fa-table"/>
                              Главные результаты парсинга
                          </div>
                          <div className="card-body  outer">
                              { this.state.errorMessage && this.state.errorMessage !== '' ?
                                  <div className="alert alert-danger">
                                      { this.state.errorMessage}
                                  </div> : ''}

                              <div className="table-responsive scrolling">

                                  <table className="table table-bordered table-sm table-hover" id="dataTable" width="100%" cellSpacing="0">
                                      <thead>
                                      <tr>
                                          <th className="zui-sticky-col">Главный заголовок</th>
                                          <th  className="zui-sticky-col2">Идентификатор (артикул)</th>
                                          <th>Ссылка</th>
                                          {this.state.sites.length>0 ?
                                              this.state.sites.map(site =>
                                                  <th>Ссылка {site.name}</th>
                                              ): ''}
                                          <th>Цена {(this.state.page==='stevian')?'stevian':'santehrai'}</th>
                                          <th>Цена {(this.state.page==='stevian')?'santehrai':'stevian'}</th>
                                          {this.state.sites.length>0 ?
                                              this.state.sites.map(site =>
                                                  <th>Цена {site.name}</th>
                                              ): ''}
                                          <th>Приоритетный товар</th>
                                      </tr>
                                      </thead>
                                      <tbody>
                                      <tr className={'filters'}>
                                          <td className="zui-sticky-col"><input type="text" disabled={!this.state.filterEnabled} onChange={this.handleFilterChange.bind(this)} className="form-control" value={this.state.filter.filter_main_product_title} name={'filter_main_product_title'}/></td>
                                          <td className="zui-sticky-col2"><input type="text" disabled={!this.state.filterEnabled}  onChange={this.handleFilterChange.bind(this)} className="form-control" value={this.state.filter.filter_identificator} name={'filter_identificator'}/></td>
                                          <td><input type="text" disabled={!this.state.filterEnabled}  onChange={this.handleFilterChange.bind(this)} className="form-control" value={this.state.filter.filter_main_product_link} name={'filter_main_product_link'}/></td>
                                          <td></td>
                                          <td></td>
                                          <td></td>
                                          <td></td>
                                          <td></td>
                                          <td></td>
                                      </tr>
                                      {this.state.dbinfo.length>0 ?
                                      this.state.dbinfo.map(dbinfo =>
                                          <tr key={dbinfo.id}>
                                              <td className="zui-sticky-col"><Link to={'main/'+dbinfo.id}>{dbinfo.main_product_title.substr(0,30)}...</Link></td>
                                              <td  className="zui-sticky-col2">{dbinfo.identificator}</td>
                                              <td><a href={dbinfo.main_product_link} target="_blank" rel="noopener noreferrer">{dbinfo.main_product_link.substr(0,30)}...</a></td>
                                              {this.state.sites.length>0 ?
                                                  this.state.sites.map(site =>
                                                      <td key={site.name}>{dbinfo['link_'+site.name] ? <a href={dbinfo['link_'+site.name]} target="_blank" rel="nofollow">*</a> : '-' }</td>
                                                  ): ''}
                                              <td>{ (dbinfo.main_product_price>0) ? parseInt(dbinfo.main_product_price, 10) : 0}</td>
                                              {dbinfo.second_product_price>0
                                                  ? <td style={{width:'1%',
                                                      whiteSpace:'nowrap'}}>
                                                      <span style={{color:((dbinfo.main_product_price>dbinfo.second_product_price) ? 'red' : ((dbinfo.main_product_price<dbinfo.second_product_price) ? 'green' : 'black'))}}><i className={"fa fa-arrow-"+((dbinfo.main_product_price>dbinfo.second_product_price)? 'down' : ((dbinfo.main_product_price<dbinfo.second_product_price) ? 'up' : 'right'))} aria-hidden="true"/> {(dbinfo.second_product_price>0 && dbinfo.main_product_price>0) ? ((dbinfo.second_product_price-dbinfo.main_product_price)/dbinfo.main_product_price*100).toFixed() : 0}%</span>
                                                      <span> {parseInt(dbinfo.second_product_price,10)}</span></td>
                                                  :<td>-</td>}


                                              {this.state.sites.length>0 ?
                                                  this.state.sites.map(site_price =>
                                                      dbinfo['price_'+site_price.name]>0
                                                          ?
                                                          <td style={{width:'1%',
                                                              whiteSpace:'nowrap'}}>
                                                              <span style={{color:((dbinfo.main_product_price>dbinfo['price_'+site_price.name]) ? 'red' : ((dbinfo.main_product_price<dbinfo['price_'+site_price.name]) ? 'green' : 'black'))}}><i className={"fa fa-arrow-"+((dbinfo.main_product_price>dbinfo['price_'+site_price.name])? 'down' : ((dbinfo.main_product_price<dbinfo['price_'+site_price.name]) ? 'up' : 'right'))} aria-hidden="true"/> {((dbinfo['price_'+site_price.name]-dbinfo.main_product_price)/dbinfo.main_product_price*100).toFixed()}%</span>
                                                              <span> {parseInt(dbinfo['price_'+site_price.name],10)}</span>
                                                          </td>
                                                          :<td>-</td>
                                                  ): ''}

                                                  <td><input type="checkbox" name={'priority'}  defaultChecked={dbinfo.priority===1 ? 'checked' : ''} onChange={e=> this.checkBoxCheck(e,dbinfo.id)}/></td>
                                          </tr>
                                      )

                                          : <tr ><td  colSpan={9}><div className="loader"></div></td></tr>
                                      }

                                      </tbody>
                                  </table>


                              </div>

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
                              <button id="exportStart"  onClick={e=>exportTable(e,'/parse_results?site='+this.state.page)} className={"btn btn-success"}><i className="fa fa-file-excel-o fa-3x" aria-hidden="true"></i></button>
                              <a  id="downloadExport" download={true}  className={"d-none"}>Export</a>
                          </div>
                      </div>
                  </div>
              </div>



    );
  }
}



ResultsMain.propTypes = {
    domain: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    domain:state.domain
})

export default connect(mapStateToProps)(ResultsMain);