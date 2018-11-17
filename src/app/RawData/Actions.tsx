import {
    fetchAction,
    jsonHeaders,
    responseReloadAction,
    whenComplete
} from 'redux-api-rest'

export const FETCH_RAW_DATA = "RAW_DATA_FETCH";


export const fetchRawData = ()=>{
    return fetchAction('/api/raw-data/', FETCH_RAW_DATA);
}

export const updateRawData = ()=> {
    return fetchAction('/api/raw-data/', responseReloadAction(FETCH_RAW_DATA));
}

export const addTag = (rds, tag)=>{
    return fetchAction('/api/raw-data/'+rds+'/link/', [ whenComplete(updateRawData) ] as any, {
        body: JSON.stringify({tag}),
        headers: jsonHeaders(),
        method: "POST"
    })
}

export const removeTag = (rds, tag)=>{
    return fetchAction('/api/raw-data/'+rds+'/link/', whenComplete(updateRawData), {
        body: JSON.stringify({tag}),
        headers: jsonHeaders(),
        method: "DELETE",
    })
}