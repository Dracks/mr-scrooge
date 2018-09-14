import { 
    fetchAction, 
    compose, 
//    responseReloadAction, 
//    saveAction, 
//    deleteAction, 
    responseAction
} from '../../../network/Actions'

export const FILTERS_PARENT = "FILTERS/TAG"
export const FETCH_FILTER_TYPES = "FILTER_TYPES_FETCH";
export const FETCH_FILTER = "FILTER_FETCH";

export const fetchFiltersTypes = () =>{
    return fetchAction('/api/tag-filter/types', FETCH_FILTER_TYPES)
}

export const fetchFilters = (tag)=>(
    fetchAction('/api/tag-filter/?tag='+tag.id, 
        compose(FILTERS_PARENT, 
            responseAction(FETCH_FILTER), 
            tag.id)
    )
)