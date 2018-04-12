import { fetchAction, responseReloadAction } from '../../network/Actions'

export const FETCH_RAW_DATA = "RAW_DATA_FETCH";


export const fetchRawData = ()=>{
    return fetchAction('/api/raw-data/', FETCH_RAW_DATA);
}

export const updateRawData = ()=> {
    return fetchAction('/api/raw-data/', responseReloadAction(FETCH_RAW_DATA));
}

export const removeTag = (rds, tag)=>{
    return fetchAction('/api/raw-data/'+rds+'/unlink', updateRawData(), {body: JSON.stringify({tag}),
    method: "DELETE"})
}