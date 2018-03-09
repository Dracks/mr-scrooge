import { fetchAction } from '../../network/Actions'

export const FETCH_TAGS = "TAGS_FETCH";
export const FETCH_FILTER_TYPES = "FILTER_TYPES_FETCH";

export const fetchTags = ()=>{
    return fetchAction('/api/tag/', FETCH_TAGS);
}

export const updateTags = ()=>{
    return fetchAction('/api/tag/', FETCH_TAGS, true);
}

export const fetchFiltersTypes = () =>{
    return fetchAction('/api/tag-filter/types', FETCH_FILTER_TYPES)
}