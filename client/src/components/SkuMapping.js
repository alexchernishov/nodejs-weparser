import React, { Component } from 'react';
import axios from "axios/index";
import Pagination from "react-js-pagination";
import {connect} from "react-redux";
import Editable from 'react-x-editable';
import PropTypes from 'prop-types';
import $ from 'jquery';
window.jQuery = $;
window.$ = $;
global.jQuery = $;


class SkuMapping extends Component {


    state = {
        list: [],
        activePage: 1,
        limit: 10,
        total:30,
        page:'stevian',
        successMessage:false,
        errorMessage:false
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

    handleSubmit(event) {

        let data = new FormData(event.target);
        if(data){
            let currentSku = data.get('currentSku');
            let realSku = data.get('realSku');
            let site = this.props.domain.site;
            data.append('site', this.props.domain.site);
            if(currentSku && realSku){
                axios({
                    method: 'post',
                    url: '/sku-mapping/add',
                    data: {
                        currentSku : currentSku,
                        realSku : realSku,
                        site : site,
                    },
                    config: { headers: { 'Content-Type': 'application/json' }}
                })
                    .then(res => {
                        if(res.data && res.data.success){
                            this.setState({successMessage: true});
                            this.getResults();
                            setTimeout(function () {
                                this.setState({successMessage: false});
                            }.bind(this),3000)
                        }
                        event.target.reset();
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

        }
        event.preventDefault();
    }


    getResults(pageNumber){

        pageNumber = pageNumber ? pageNumber : this.state.activePage;
        axios.get('/sku-mapping/list?site='+this.state.page+'&limit='+this.state.limit+'&page='+pageNumber, )
            .then(res => {
                let list = res.data.result ? res.data.result : [];
                let total = res.data.count ? res.data.count : [];
                this.setState({ list });
                this.setState({ total })
            })
            .catch(err => {
                let list = [];
                let total = [];
                this.setState({ list });
                this.setState({ total });
                if (err.response) {
                    if(err.response.status === 401){
                        window.location.href = '/login'
                    }
                }
            });
    }

    changeValue(e,name,id){
        axios({
            method: 'post',
            url: '/sku-mapping/change',
            data: {
                id : id,
                name : name,
                value : e.newValue,
            },
            config: { headers: { 'Content-Type': 'application/json' }}
        })
            .then(res => {
                if(res.data && res.data.success){
                }
            })
            .catch(err => {
                if(err.response && err.response.data && err.response.data.sqlMessage){
                }
            })
    }

    setId(e,id){
          let   removeBtn = $('.modal').find('.delete-item');
        removeBtn.attr('data-id', id);
    }
    deleteItem(e){
          let id = e.target.dataset.id;
          if(id && id!==undefined){
              axios({
                  method: 'post',
                  url: '/sku-mapping/delete',
                  data: {
                      id : id,
                  },
                  config: { headers: { 'Content-Type': 'application/json' }}
              })
                  .then(res => {
                      if(res.data && res.data.success){
                          $('.modal').modal('hide');
                          this.getResults();
                      }
                  })
                  .catch(err => {
                      if(err.response && err.response.data && err.response.data.sqlMessage){

                      }
                  })
          }

    }

  render() {

      return (
              <div id="content-wrapper">
                  <div className="container-fluid">

                      <div className="row  mb-3">
                          <div className="col-lg-6">
                              <form onSubmit={this.handleSubmit.bind(this)}>
                                  { this.state.successMessage ? <div className="alert alert-success hide">
                                      Успешно!
                                  </div> : ''
                                  }
                                  { this.state.errorMessage && this.state.errorMessage !== '' ?
                                  <div className="alert alert-danger">
                                      { this.state.errorMessage}
                                  </div> : ''}
                                  <div className="form-group">
                                      <label htmlFor="exampleInputEmail1">Текущий идентификатор(артикул)</label>
                                      <input type="text" name={'currentSku'}  className="form-control" aria-describedby="currentskuHelp" placeholder="Current sku"/>
                                  </div>
                                  <div className="form-group">
                                      <label htmlFor="exampleInputEmail1">Реальный идентификатор(артикул)</label>
                                      <input type="text" name={'realSku'}  className="form-control" aria-describedby="realskuHelp" placeholder="Real sku"/>
                                  </div>
                                  <button type="submit" className="btn btn-primary">Отправить</button>
                              </form>
                          </div>

                      </div>
                      <div className="row">
                          <div className="col-lg-12">
                              <div className="card mb-3">
                                  <div className="card-header">
                                      <i className="fa fa-table"/>
                                      Таблица соответствий идентификаторов(артикулов)
                                  </div>
                                  <div className="card-body">

                                      {this.state.list.length>0 ?
                                      <div className="table-responsive">
                                          <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                              <thead>
                                              <tr>
                                                  <th>Текущий - Мой Артикул</th>
                                                  <th>Реальный - Артикул Конкурента</th>
                                                  <th>Сайт</th>
                                                  <th>Удалить</th>
                                              </tr>
                                              </thead>
                                              <tbody>
                                              {this.state.list.map(item =>
                                                  <tr key={item.id}>
                                                      <td>
                                                          <Editable
                                                              name="current_sku"
                                                              dataType="text"
                                                              mode="inline"
                                                              title="Введите значение"
                                                              value={item.current_sku}
                                                              handleSubmit={e=> this.changeValue(e,'current_sku',item.id)}
                                                          />
                                                      </td>
                                                      <td>
                                                          <Editable
                                                              name="current_sku"
                                                              dataType="text"
                                                              mode="inline"
                                                              title="Введите значение"
                                                              value={item.real_sku}
                                                              handleSubmit={e=> this.changeValue(e,'real_sku',item.id)}
                                                          /></td>
                                                      <td>
                                                          <Editable
                                                              dataType="select"
                                                              name={"site"}
                                                              value={item.site}
                                                              title="Выберите сайт"
                                                              options={[
                                                                  {value : 'stevian', text: "stevian"},
                                                                  {value : 'santehrai', text: "santehrai"}
                                                              ]}
                                                              handleSubmit={e=> this.changeValue(e,'site',item.id)}
                                                          />
                                                      </td>
                                                      <td><a data-toggle="modal" data-target="#confirm-delete" onClick={e=> this.setId(e,item.id)}><i className={'fa fa-trash'}></i></a></td>
                                                  </tr>
                                              )}

                                              </tbody>
                                          </table>
                                          <nav>
                                              <Pagination
                                                  activePage={this.state.activePage}
                                                  itemsCountPerPage={this.state.limit}
                                                  totalItemsCount={this.state.total}
                                                  pageRangeDisplayed={5}
                                                  itemClass={'page-item'}
                                                  linkClass={'page-link'}
                                                  onChange={this.handlePageChange.bind(this)}
                                              />
                                          </nav>
                                      </div>

                                          : <tr ><td  colSpan={3}><div className="loader"></div></td></tr>}
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
                  <div className="modal fade" id="confirm-delete" tabIndex="-1" role="dialog"
                       aria-labelledby="myModalLabel" aria-hidden="true">
                      <div className="modal-dialog">
                          <div className="modal-content">
                              <div className="modal-body">
                                  Вы действительно хотите удалить эту строку?
                              </div>
                              <div className="modal-footer">
                                  <button type="button" className="btn btn-default" data-dismiss="modal">Нет</button>
                                  <a className="btn btn-danger btn-ok delete-item"  onClick={e=> this.deleteItem(e)}>Да</a>
                              </div>
                          </div>
                      </div>
                  </div>
              </div>



    );
  }
}



SkuMapping.propTypes = {
    domain: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
    domain:state.domain
});

export default connect(mapStateToProps)(SkuMapping);



