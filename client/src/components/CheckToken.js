import {logoutUser, setCurrentUser} from "../actions/authentication";
import setAuthToken from "../setAuthToken";
import jwt_decode from "jwt-decode";
import store from "../store";

const CheckToken = ()=>{


    if(localStorage.jwtToken && localStorage.jwtToken!==undefined) {
        setAuthToken(localStorage.jwtToken);
        const decoded = jwt_decode(localStorage.jwtToken);
        store.dispatch(setCurrentUser(decoded));

        const currentTime = Date.now() / 1000;
        if(decoded.exp < currentTime) {
            store.dispatch(logoutUser());
            return false;
        }else{
            return true;
        }
    }else{

        console.log(localStorage.jwtToken);
        return false
    }
};
export default CheckToken;