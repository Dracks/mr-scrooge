import { deleteAction, fetchAction, responseReloadAction, saveAction } from 'redux-api-rest'
import { MetaData } from 'redux-api-rest';
import { RawDataActions } from '../RawData/Actions';

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
    return fetchAction('/api/tag/'+tag.id+'/apply_filters/', [()=>RawDataActions.update()], {
        method: 'POST'
    })
}

export const destroyTag = (tag, onDeleted) =>{
    return deleteAction('/api/tag/:id', [(meta:MetaData)=>!meta.isLoading && onDeleted(), updateTags], tag)
}