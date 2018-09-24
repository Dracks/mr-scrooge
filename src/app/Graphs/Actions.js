import { fetchAction, responseReloadAction, saveAction, deleteAction } from 'react-redux-rest';

export const FETCH_GRAPHS = "GRAPH_FETCH";
export const ADD_GRAPH = "GRAPH_ADD";
export const REMOVE_GRAPH = "GRAPH_REMOVE";

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
        type: ADD_GRAPH
    }
}

export const deleteGraph= (data)=>{
    if (data.id){
        return deleteAction('/api/graph/:id/', (isLoading)=>!isLoading && updateGraphs(), data)
    } else {
        return {
            type: REMOVE_GRAPH,
            payload: data
        }
    }
}