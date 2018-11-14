import { deleteAction, fetchAction, responseReloadAction, saveAction } from 'redux-api-rest'
import { updateRawData } from '../RawData/Actions';

export const FETCH_TAGS = "TAGS_FETCH";

export const fetchTags = ()=>{
    return fetchAction('/api/tag/', FETCH_TAGS);
}

export const updateTags = ()=>{
    return fetchAction('/api/tag/', responseReloadAction(FETCH_TAGS));
}

export const saveTag = (tag)=>{
    return saveAction('/api/tag/:id/',[updateTags], tag)
}

export const applyFilters = (tag) => {
    return fetchAction('/api/tag/'+tag.id+'/apply_filters/', [updateRawData], {
        method: 'POST'
    })
}

export const destroyTag = (tag, onDeleted) =>{
    return deleteAction('/api/tag/:id', [(isLoading)=>!isLoading && onDeleted(), updateTags], tag)
}