import { deleteAction, fetchAction, responseReloadAction } from 'redux-api-rest';
import { MetaData } from 'redux-api-rest';

export const FETCH_IMPORT_STATUS = "IMPORT_STATUS_FETCH";
export const FETCH_IMPORT_KINDS = "KINDS_IMPORT_FETCH";

const ImportActions = {
    fetch:()=>{
        return fetchAction('/api/status/', FETCH_IMPORT_STATUS);
    },
    getKinds: ()=>{
        return fetchAction('/api/status/file_regex/', FETCH_IMPORT_KINDS);
    },
    getReport: (ids, callback) => {
        const request = ids.rows.map((e)=>"ids[]="+e).join("&");
        return fetchAction('/api/status-row/?'+request, callback)
    },
    remove: (status, callback)=>{
        return deleteAction('/api/status/:id/', callback, status)
    },
    sendFile: (data, callback) => {
        return fetchAction('/api/import/upload/', [ 
            (meta:MetaData, subdata)=>{
                if (!meta.isLoading && subdata) {
                    return ImportActions.update((meta2: MetaData)=>
                        !meta2.isLoading && callback(subdata)
                    )
                } 
            }
            ], {
            body: data,
            method: 'POST',
        })
    },
    update: (callback)=>{
        const r = [responseReloadAction(FETCH_IMPORT_STATUS)]
        if (callback){
            r.push(callback);
        }
        return fetchAction('/api/status/', r);
    },
}

export default ImportActions;