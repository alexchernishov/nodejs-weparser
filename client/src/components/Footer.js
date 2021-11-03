import React from 'react';
import PropTypes from 'prop-types';
import {connect} from "react-redux";

class Footer extends React.Component {


    render(){

        const {isAuthenticated,} = this.props.auth;
        return (
            isAuthenticated?

            <footer className="sticky-footer">
                <div className="container my-auto">
                    <div className="copyright text-center my-auto">
                        <span>Copyright © 2018</span>
                    </div>
                    <div className="text-center my-auto">
                        Powered by <a href="https://rebus.digital" target="_blank" rel="noopener noreferrer">Rebus</a>
                    </div>
                </div>
            </footer>
                :''
        )
    }

}
Footer.propTypes = {
    auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
    auth: state.auth
})

export default connect(mapStateToProps)(Footer);