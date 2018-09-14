import React from 'react';
import { connect } from 'react-redux';

import { WithNotFound } from '../../components/NotFound';
import Form from './Form';
import {saveTag, applyFilters, destroyTag} from './Actions';
import TagsFilterTable from './Filters/TagsFilterTable';
import { fetchFiltersTypes } from "./Filters/Actions";

const CompleteForm = (props) => {
    let tagProps = {
        value:props.value,
        saveTag:props.saveTag,
        destroyTag:props.destroyTag,
        applyFilters:props.applyFilters,
        hashTags:props.hashTags,
        tags:props.tags
    }
    let filterProps = {
        tag:props.value,
        types:props.types,
        fetchFiltersTypes: props.fetchFiltersTypes
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

const mapStateToProps = ({tags, hashTags, filterTypes}, {match}) => {
    var id=parseInt(match.params.id, 10)
    var l=tags.data.filter((e)=> e.id===id)
    var tag = l[0]
    return {
        tags: tags.data,
        hashTags,
        value: tag,
        types: filterTypes
    }
}

export default connect(mapStateToProps, (dispatch)=>({
    saveTag: (tag)=>dispatch(saveTag(tag)),
    applyFilters: (tag) => dispatch(applyFilters(tag)),
    destroyTag: (tag, onDelete)=>dispatch(destroyTag(tag, onDelete)),
    fetchFiltersTypes: ()=>dispatch(fetchFiltersTypes())
}))(NotFoundForm)