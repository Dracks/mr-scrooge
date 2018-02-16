import { fetchAction } from '../../network/Actions'

export const FETCH_RAW_DATA = "RAW_DATA_FETCH";

export const fetchRawData = ()=>{
    return fetchAction('/api/raw-data', FETCH_RAW_DATA);
}