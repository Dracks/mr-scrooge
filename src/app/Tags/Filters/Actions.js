import { fetchAction, responseReloadAction, saveAction, deleteAction } from '../../../network/Actions'

export const FILTERS_PARENT = "FILTERS/TAG"
export const FETCH_FILTER_TYPES = "FILTER_TYPES_FETCH";
export const FILTER_FETCH = "FILTER_FETCH";

export const fetchFiltersTypes = () =>{
    return fetchAction('/api/tag-filter/types', FETCH_FILTER_TYPES)
}