import { SET_DOMAIN} from '../actions/types';


const initialState = {
    site: 'stevian'
};

export default function(state = initialState, action ) {
    switch(action.type) {
        case SET_DOMAIN:
            return {
                ...state,
                site: action.payload
            }
        default:
            return state;
    }
}