import { fetchReducer } from "redux-api-rest";

import { ADD_GRAPH, FETCH_GRAPHS, REMOVE_GRAPH } from './Actions';

const reducer = fetchReducer(FETCH_GRAPHS);

const graphReducer = (state, action)=>{
    state = reducer(state, action);
    if (action.type === ADD_GRAPH){
        const data = (state.data || []).concat({})
        state = Object.assign({}, state, {data})
    } else if (action.type === REMOVE_GRAPH){
        const data = state.data;
        const obj = action.payload;
        const index = data.indexOf(obj);
        if (index>=0){
            data.splice(index, 1)
            state = Object.assign({}, state, {data});
        }
    }
    return state;
}


export default graphReducer;