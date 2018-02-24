import { fetchAction } from '../../network/Actions'

export const FETCH_TAGS = "TAGS_FETCH";

export const fetchTags = ()=>{
    return fetchAction('/api/tag/', FETCH_TAGS);
}