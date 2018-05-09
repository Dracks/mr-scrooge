import { fetchAction, responseReloadAction, saveAction } from '../../network/Actions';

export const FETCH_GRAPHS = "GRAPH_FETCH";
export const ADD_GRAPHS = "GRAPH_ADD";

export const fetchGraphs = ()=>{
    return fetchAction('/api/graph/', FETCH_GRAPHS);
}

export const updateGraphs = ()=>{
    return fetchAction('/api/graph/', responseReloadAction(FETCH_GRAPHS))
}

export const saveGraphs = (data)=>{
    return saveAction('/api/graph/:id/', (isLoading)=>!isLoading && updateGraphs(), data);
}

export const addGraph=()=>{
    return {
        type: ADD_GRAPHS
    }
}