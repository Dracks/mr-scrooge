import { 
    compose, 
    deleteAction, 
    fetchAction, 
    responseAction, 
    responseReloadAction, 
    saveAction,
    whenComplete
} from 'redux-api-rest'

export const FILTERS_PARENT = "FILTERS/TAG"
export const FETCH_FILTER_TYPES = "FILTER_TYPES_FETCH";
export const FETCH_FILTER = "FILTER_FETCH";
export const SAVE_FILTER = "SAVE_FILTER";

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

export const updateFilters = (tag)=>(
    fetchAction('/api/tag-filter/?tag='+tag.id, 
        compose(FILTERS_PARENT, 
            responseReloadAction(FETCH_FILTER), 
            tag.id)
    )
)

export const saveFilter = (filter) => (
    saveAction('/api/tag-filter/:id/',
        whenComplete(()=>updateFilters({id: filter.tag})),
        filter)
)

export const deleteFilter = (filter) => (
    deleteAction('/api/tag-filter/:id/', 
        whenComplete(()=>updateFilters({id: filter.tag})),
        filter)
)