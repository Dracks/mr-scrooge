import { fetchAction, responseReloadAction } from 'redux-api-rest';
import { updateRawData } from '../RawData/Actions';

export const FETCH_IMPORT_STATUS = "IMPORT_STATUS_FETCH";
export const FETCH_IMPORT_KINDS = "KINDS_IMPORT_FETCH";

export const fetchStatus = ()=>{
    return fetchAction('/api/status/', FETCH_IMPORT_STATUS);
}

export const updateStatus = (callback)=>{
    const r = [responseReloadAction(FETCH_IMPORT_STATUS)]
    if (callback){
        r.push(callback);
    }
    return fetchAction('/api/status/', r);
}

export const fetchImportKinds = ()=>{
    return fetchAction('/api/status/kinds/', FETCH_IMPORT_KINDS);
}

export const sendFile = (data, callback) => {
    return fetchAction('/api/import/upload/', [updateRawData, (isLoading, subdata)=>!isLoading && subdata && updateStatus((isLoading2)=>!isLoading2 && callback(subdata))], {
        body: data,
        method: 'POST',
    })
}

export const getStatusReport = (ids, callback) => {
    const request = ids.rows.map((e)=>"ids[]="+e).join("&");
    return fetchAction('/api/status-row/?'+request, callback)
}