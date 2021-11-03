import React, { Component } from 'react';
import axios from "axios/index";
import 'react-datepicker/dist/react-datepicker.css';
import moment from 'moment';
import {connect} from "react-redux";

import PropTypes from 'prop-types';

class ParseCount extends Component {

    state = {
        dbinfo: [],
        dates: [],
        startDate: moment(),
        page:'stevian',
    };

    componentDidMount() {
        this.setState({page: this.props.domain.site});
        this.handleDateChange = this.handleDateChange.bind(this);
       this.getResults();
    }
    componentDidUpdate(prevProps) {

    }
    // NEW WAY
    static getDerivedStateFromProps(nextProps, prevState){

        return {
            page : nextProps.domain.site
        };
    }



    getResults(date=false){
        let urlDate = "";
        if(date !==false){
            urlDate = "?date="+date;
        }

        axios.get('/parse_results/count-stat'+urlDate)
            .then(res => {
                let dbinfo = res.data.result;
                let dates = res.data.dates;

                if(!date){
                    let startDate = res.data.dates[0].date_created;
                    this.setState({ startDate });
                }

                this.setState({ dbinfo });
                this.setState({ dates });
            })
            .catch(err => {
                console.log(err);
                let dbinfo = [];
                this.setState({ dbinfo });
                if (err.response) {
                    if(err.response.status === 401){
                        window.location.href = '/login'
                    }
                }
            });
    }

    handleDateChange(e) {
        this.setState({
            startDate: e.target.value
        });
        this.getResults(e.target.value);
    }

  render() {
    return (
        <div id="content-wrapper">
            <div className="container-fluid">


                <div className="card mb-3">
                    <div className="card-header">
                        <i className="fa fa-table"></i>
                        Статистика парсинга
                    </div>
                    <div className="card-body">


                        <div className="table-responsive">
                            <select name="datepicker" onChange={this.handleDateChange}>
                                {this.state.dates.map((date,index) =>
                                        <option key={index} value={date.date_created}>{date.date_created}</option>
                                    )
                                    }
                            </select>
                            <table className="table table-bordered" id="dataTable" width="100%" cellSpacing="0">
                                <thead>
                                <tr>
                                    <th>Сайт</th>
                                    <th>Количество страниц</th>
                                    <th>Дата</th>
                                </tr>
                                </thead>
                                <tbody>

                                {this.state.dbinfo.length>0 ?
                                this.state.dbinfo.map((dbinfo,index) =>
                                    <tr key={index}>
                                        <td><a href={dbinfo.link_group} target="_blank" rel="nofollow">{dbinfo.link_group}</a></td>
                                        <td>{dbinfo.total}</td>
                                        <td>{dbinfo.date_created}</td>
                                    </tr>
                                )
                                    : <tr ><td  colSpan={3}><div className="loader"></div></td></tr>}
                                </tbody>
                            </table>

                        </div>
                    </div>
                </div>
            </div>
        </div>



    );
  }
}



ParseCount.propTypes = {
    domain: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    domain:state.domain
})

export default connect(mapStateToProps)(ParseCount);