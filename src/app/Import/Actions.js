import { fetchAction } from '../../network/Actions'

export const FETCH_IMPORT_STATUS = "IMPORT_STATUS_FETCH";
export const FETCH_IMPORT_KINDS = "KINDS_IMPORT_FETCH";

export const fetchStatus = ()=>{
    return fetchAction('/api/status/', FETCH_IMPORT_STATUS);
}

export const updateStatus = ()=>{
    return fetchAction('/api/status/', FETCH_IMPORT_STATUS);
}

export const fetchImportKinds = ()=>{
    return fetchAction('/api/status/kinds/', FETCH_IMPORT_KINDS);
}