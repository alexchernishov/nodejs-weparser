import { combineReducers } from 'redux';
import errorReducer from './errorReducer';
import authReducer from './authReducer';
import domainReducer from './domainReducer';
export default combineReducers({
    errors: errorReducer,
    auth: authReducer,
    domain: domainReducer,
});