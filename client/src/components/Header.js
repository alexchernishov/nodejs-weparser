import React from 'react';
import {
    Link,
}from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { logoutUser } from '../actions/authentication';
import { withRouter } from 'react-router-dom';

import store from "../store";
import { setDomain } from '../actions/domains';

class Header extends React.Component {



    onLogout(e) {
        e.preventDefault();
        this.props.logoutUser(this.props.history);
    }

    changeDomain(site){
        store.dispatch( setDomain({ site: site}) );
    }


    render(){
        const {isAuthenticated} = this.props.auth;
        const authLinks = (
                <a className="dropdown-item" onClick={this.onLogout.bind(this)}>
                    Выход
                </a>
        )
        const guestLinks = (
            <Link className="dropdown-item" to="/login">Sign In</Link>
        )
        return (
            isAuthenticated?
            <nav className="navbar navbar-expand navbar-dark bg-dark static-top">

                <Link className="navbar-brand mr-1" to="/">Добро пожаловать</Link>

                <button className="btn btn-link btn-sm text-white order-1 order-sm-0" id="sidebarToggle">
                    <i className="fa fa-bars"></i>
                </button>


                <ul className="navbar-nav ml-auto d-none d-md-inline-block form-inline ml-md-4 mr-0 mr-md-3 my-2 my-md-0">

                    <li className="nav-item dropdown no-arrow">
                        <a className="nav-link dropdown-toggle"  id="userDropdown" role="button"
                           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            {this.props.domain.site}
                        </a>
                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                            {(this.props.domain.site==='santehrai') ?
                                <a  className="dropdown-item" onClick={this.changeDomain.bind(this, 'stevian')}>
                                    Stevian
                                </a>
                            :
                                <a  className="dropdown-item" onClick={this.changeDomain.bind(this,'santehrai')}>
                                    Santehrai
                                </a>
                            }


                        </div>
                    </li>
                </ul>

                <ul className="navbar-nav ml-auto d-none d-md-inline-block form-inline ml-auto mr-0 mr-md-3 my-2 my-md-0">

                    <li className="nav-item dropdown no-arrow">
                        <a className="nav-link dropdown-toggle"  id="userDropdown" role="button"
                           data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                            <i className="fa fa-user-circle fa-fw"></i>
                        </a>
                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">

                            {isAuthenticated ? authLinks : guestLinks}
                        </div>
                    </li>
                </ul>

            </nav>
                :''
        )
    }

}
Header.propTypes = {
    logoutUser: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired,
    domain: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth,
    domain:state.domain
})

export default connect(mapStateToProps, { logoutUser })(withRouter(Header));