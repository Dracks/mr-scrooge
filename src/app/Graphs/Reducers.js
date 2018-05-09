import fetchReducer from "../../network/FetchReducer";

import { FETCH_GRAPHS, ADD_GRAPHS } from './Actions';

const reducer = fetchReducer(FETCH_GRAPHS);

const graphReducer = (state, action)=>{
    state = reducer(state, action);
    if (action.type === ADD_GRAPHS){
        const data = (state.data || []).concat({})

        state = Object.assign({}, state, {data})
    }
    return state;
}


export default graphReducer;