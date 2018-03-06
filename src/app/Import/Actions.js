import { fetchAction } from '../../network/Actions'

export const FETCH_IMPORT_STATUS = "IMPORT_STATUS_FETCH";

export const fetchStatus = ()=>{
    return fetchAction('/api/status/', FETCH_IMPORT_STATUS);
}