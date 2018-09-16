import React from 'react';
import { connect } from 'react-redux';

import { WithNotFound } from '../../components/NotFound';
import Form from './Form';
import {saveTag, applyFilters, destroyTag} from './Actions';
import TagsFilterTable from './Filters/TagsFilterTable';
import { fetchFiltersTypes, fetchFilters, saveFilter, deleteFilter } from "./Filters/Actions";
import MultiPropsLoadingHOC from '../../network/MultiPropsLoadingHOC';
import { extractData } from '../../network/LoadingHoc';

const CompleteForm = (props) => {
    let tagProps = {
        value:props.value,
        saveTag:props.saveTag,
        destroyTag:props.destroyTag,
        applyFilters:props.applyFilters,
        hashTags:props.hashTags,
        tags:props.tags,
    }
    let filterProps = {
        tag:props.value,
        types:props.types,
        filtersList: props.filtersList,
        isLoading: props.isLoading,
        loadFilters: props.loadFilters,
        saveFilter: props.saveFilter,
        deleteFilter: props.deleteFilter,
    }
    return (
        <div>
            <h2>Edit {props.value.name}</h2>
            <Form {...tagProps} />
            <TagsFilterTable {...filterProps} />
        </div>
    )
}

const NotFoundForm = WithNotFound(CompleteForm, 'value');

const isLoadingFilter = MultiPropsLoadingHOC(['filtersList', 'filterTypes']);

const mapStateToProps = ({tags, hashTags, filterTypes, tagsFilters}, {match}) => {
    var id=parseInt(match.params.id, 10)
    var l=tags.data.filter((e)=> e.id===id)
    var tag = l[0]
    var filtersList = tagsFilters[tag.id]
    return {
        tags: tags.data,
        hashTags,
        value: tag,
        types: extractData(filterTypes),
        filtersList: extractData(filtersList),
        isLoading: isLoadingFilter({filtersList, filterTypes})
    }
}

export default connect(mapStateToProps, (dispatch)=>({
    saveTag: (tag)=>dispatch(saveTag(tag)),
    applyFilters: (tag) => dispatch(applyFilters(tag)),
    destroyTag: (tag, onDelete)=>dispatch(destroyTag(tag, onDelete)),
    loadFilters: ({types, tag})=>{
        if (!types){
            dispatch(fetchFiltersTypes())
        }
        dispatch(fetchFilters(tag))
    },
    saveFilter: (filter)=>dispatch(saveFilter(filter)),
    deleteFilter: (filter)=>dispatch(deleteFilter(filter))
}))(NotFoundForm)