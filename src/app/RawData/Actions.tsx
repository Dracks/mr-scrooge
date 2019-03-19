import {
    fetchAction,
    jsonHeaders,
    responseReloadAction,
    whenComplete
} from 'redux-api-rest'

import * as moment from 'moment';

export const FETCH_RAW_DATA = "RAW_DATA_FETCH";

const DATE_FORMAT_REQUEST = "YYYY-MM-DD"

export const RawDataActions = {
    fetch: (to=moment())=>{
        const from= to.clone().subtract(6, "months")
        return fetchAction('/api/raw-data/?from='+from.format(DATE_FORMAT_REQUEST)+'&to='+to.format(DATE_FORMAT_REQUEST), [
            FETCH_RAW_DATA,
            (isLoading, data)=>{
                if (!isLoading && (data as any[]).length>0){
                    return RawDataActions.fetch(from)
                }
            }
        ]);
    },
    setDescription: (rdsId: number, description:string)=>{
        return fetchAction('/api/raw-data/'+rdsId+'/description/', [], {
            body: JSON.stringify({description}),
            headers: jsonHeaders(),
            method: "POST"
        })
    },
    update: ()=> {
        return fetchAction('/api/raw-data/', responseReloadAction(FETCH_RAW_DATA));
    },
}

export const TagActions = {
    add: (rds, tag)=>{
        return fetchAction('/api/raw-data/'+rds+'/link/', [ whenComplete(RawDataActions.update) ] as any, {
            body: JSON.stringify({tag}),
            headers: jsonHeaders(),
            method: "POST"
        })
    },
    
    remove:(rds, tag)=>{
        return fetchAction('/api/raw-data/'+rds+'/link/', whenComplete(RawDataActions.update), {
            body: JSON.stringify({tag}),
            headers: jsonHeaders(),
            method: "DELETE",
        })
    }
}