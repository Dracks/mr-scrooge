import { 
    fetchAction,
    responseReloadAction,
    whenComplete,
    jsonHeaders
} from '../../network/Actions'

export const FETCH_RAW_DATA = "RAW_DATA_FETCH";


export const fetchRawData = ()=>{
    return fetchAction('/api/raw-data/', FETCH_RAW_DATA);
}

export const updateRawData = ()=> {
    return fetchAction('/api/raw-data/', responseReloadAction(FETCH_RAW_DATA));
}

export const addTag = (rds, tag)=>{
    return fetchAction('/api/raw-data/'+rds+'/link/', [whenComplete(updateRawData), console.log], {
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