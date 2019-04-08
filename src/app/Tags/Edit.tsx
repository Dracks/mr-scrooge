import { push } from 'connected-react-router';
import * as React from 'react';
import { connect } from 'react-redux';
import { MultiPropsLoadingHOC, restChain } from 'redux-api-rest-hocs';

import { WithNotFound} from '../../components/NotFound';
import {applyFilters, destroyTag, saveTag} from './Actions';
import { deleteFilter, fetchFilters, fetchFiltersTypes, saveFilter } from "./Filters/Actions";
import TagsFilterTable from './Filters/TagsFilterTable';
import Form from './Form';

const CompleteForm = (props) => {
    /* tslint:disable object-literal-sort-keys */
    const tagProps = {
        value:props.value,
        saveTag:props.saveTag,
        destroyTag:props.destroyTag,
        applyFilters:props.applyFilters,
        hashTags:props.hashTags,
        tags:props.tags,
    }
    const filterProps = {
        tag:props.value,
        types:props.types,
        filtersList: props.filtersList,
        isLoading: props.isLoading,
        loadFilters: props.loadFilters,
        saveFilter: props.saveFilter,
        deleteFilter: props.deleteFilter,
    }
    /* tslint:enable */
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

const typesExtract = restChain().setProperty('types').build
const filtersListExtract = restChain().setProperty('filtersList').build

const mapStateToProps = ({tags, hashTags, filterTypes, tagsFilters}, {match}) => {
    const id=parseInt(match.params.id, 10)
    const l=tags.data.filter((e)=> e.id===id)
    const tag = l[0]
    const filtersList = tag && tagsFilters[tag.id]
    /* tslint:disable object-literal-sort-keys */
    return {
        tags: tags.data,
        hashTags,
        value: tag,
        types: filterTypes,
        filtersList,
        isLoading: isLoadingFilter({filtersList, filterTypes})
    }
    /* tslint:enable */
}

const mapDispatchToProps = (dispatch, {basepath})=>({
    applyFilters: (tag) => dispatch(applyFilters(tag)),
    deleteFilter: (filter)=>dispatch(deleteFilter(filter)),
    destroyTag: (tag)=>dispatch(destroyTag(tag, ()=>push(basepath))),
    loadFilters: ({types, tag})=>{
        if (!types){
            dispatch(fetchFiltersTypes())
        }
        dispatch(fetchFilters(tag))
    },
    saveFilter: (filter)=>dispatch(saveFilter(filter)),
    saveTag: (tag)=>dispatch(saveTag(tag)),
})

export default connect(mapStateToProps, mapDispatchToProps)(filtersListExtract(typesExtract(NotFoundForm)) as any)