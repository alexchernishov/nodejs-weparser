import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import {connect} from "react-redux";
// import CheckToken from './CheckToken';

const PrivateRoute = ({ component: Component, ...rest }) => (
    <Route
        {...rest}
        render={props =>
            localStorage.jwtToken ? (
                <Component {...props} />
            ) : (
                <Redirect
                    to={{
                        pathname: '/login',
                        state: { from: props.location },
                    }}
                />
            )
        }
    />
);
PrivateRoute.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth
})
export default connect(mapStateToProps)(PrivateRoute);