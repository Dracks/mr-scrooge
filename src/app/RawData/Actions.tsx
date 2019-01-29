import {
    fetchAction,
    jsonHeaders,
    responseReloadAction,
    whenComplete
} from 'redux-api-rest'

export const FETCH_RAW_DATA = "RAW_DATA_FETCH";

export const RawDataActions = {
    fetch: ()=>{
        return fetchAction('/api/raw-data/', FETCH_RAW_DATA);
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