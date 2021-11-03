import React, { Component } from 'react';
import axios from "axios/index";
import Pagination from "react-js-pagination";

class ResultHistory extends Component {

    state = {
        history: [],
        parse: [],
        activePage: 1,
        limit: 10,
        total:30,
    };

    componentDidMount() {
        this.getResults();
    }
    handlePageChange(pageNumber) {
        this.setState({activePage: pageNumber});

        this.getResults(pageNumber);
    }


    getResults(pageNumber){

        pageNumber = pageNumber ? pageNumber : this.state.activePage;
        let historyId = this.props.match.params.id;
        axios.get('/parse_results/history/'+historyId+'?limit='+this.state.limit+'&page='+pageNumber, )
            .then(res => {
                let history = res.data.history;
                let parse = res.data.parse;
                let total = res.data.count;
                this.setState({ history });
                this.setState({ parse });
                this.setState({ total })
            })
            .catch(err => {
                console.log(err);
                let dbinfo = [];
                let total = [];
                this.setState({ dbinfo })
                this.setState({ total })
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
                        <div className="card-header">
                            <i className="fa fa-table"></i>
                            <a href={this.state.parse.link}  target="_blank" rel="noopener noreferrer">{this.state.parse.title}</a> - история парсинга
                        </div>
                        <div className="card-body">

                            {this.state.history.length>0 ?
                            <div className="table-responsive">
                                <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                    <thead>
                                    <tr>
                                        <th>Цена</th>
                                        <th>Дата</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {this.state.history.map((history, index) =>
                                        <tr key={index}>
                                            <td>{history.price}</td>
                                            <td>{history.created_at}</td>
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
                                : <tr ><td  colSpan={2}><div className="loader"></div></td></tr>}
                        </div>
                    </div>
                </div>
            </div>



        );
    }
}



export default ResultHistory;