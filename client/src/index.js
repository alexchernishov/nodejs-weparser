import React from 'react';
import ReactDOM from 'react-dom';
import {
    Route,
    BrowserRouter,
    Switch

}from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/sb-admin.min.css';
import 'font-awesome/css/font-awesome.min.css';
import 'bootstrap/dist/js/bootstrap.js';
import jwt_decode from 'jwt-decode';
import setAuthToken from './setAuthToken';
import { setCurrentUser, logoutUser } from './actions/authentication';

import Home from './components/Home';
import ResultsMain from './components/ResultsMain';
import ResultHistory from './components/ResultHistory';
import ResultsOur from './components/ResultsOur';
import ResultsTheir from './components/ResultsTheir';
import ParseCount from './components/ParseCount';
import Header from './components/Header';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import NoMatch from './components/NoMatch';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import { Provider } from 'react-redux';
import store from './store';
import registerServiceWorker from './registerServiceWorker';
import SkuMapping from "./components/SkuMapping";

if(localStorage.jwtToken) {
    setAuthToken(localStorage.jwtToken);
    const decoded = jwt_decode(localStorage.jwtToken);
    store.dispatch(setCurrentUser(decoded));

    const currentTime = Date.now() / 1000;

    if(decoded.exp < currentTime) {
        store.dispatch(logoutUser());
        window.location.href = '/login'
    }
}

class App  extends React.Component{



    render() {
        return (

            <Provider store = { store }>
                <div>
                    <Header/>
                    <div id="wrapper">
                        <Sidebar/>
                        <Main />
                        <a className="scroll-to-top rounded" href="#page-top">
                            <i className="fa fa-angle-up"></i>
                        </a>
                    </div>
                    <Footer/>
                </div>

            </Provider>
        )};
}


const Main = () => (

        <Switch>
            <PrivateRoute  exact path='/' component={Home}/>
            <PrivateRoute  exact path='/main' component={ResultsMain}/>
            <PrivateRoute  exact path='/main/:id' component={ResultHistory}/>
            <PrivateRoute  exact path='/our' component={ResultsOur}/>
            <PrivateRoute  exact path='/their' component={ResultsTheir}/>
            <PrivateRoute  exact path='/sku-mapping' component={SkuMapping}/>
            <PrivateRoute  exact path='/parse-count' component={ParseCount}/>
            <Route exact path="/login" component={ Login } />
            <PrivateRoute  component={NoMatch} status={404} code={404}/>
        </Switch>
);
ReactDOM.render((
    <BrowserRouter>
        <Route path="/" component={App}  />
    </BrowserRouter>
), document.getElementById('root'));


registerServiceWorker();