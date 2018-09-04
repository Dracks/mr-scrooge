import React from 'react';
import { connect } from 'react-redux';

import { WithNotFound } from '../../components/NotFound';
import Form from './Form';
import {saveTag, applyFilters, destroyTag} from './Actions';
import TagsFilterTable from './TagsFilterTable';

const CompleteForm = (props) => {
    return (
        <div>
            <h2>Edit {props.value.name}</h2>
            <Form {...props} />
            <TagsFilterTable tag={props.value} />
        </div>
    )
}

const NotFoundForm = WithNotFound(CompleteForm, 'value');

const mapStateToProps = ({tags, hashTags}, {match}) => {
    var id=parseInt(match.params.id, 10)
    var l=tags.data.filter((e)=> e.id===id)
    var tag = l[0]
    return {
        tags: tags.data,
        hashTags,
        value: tag,
    }
}

export default connect(mapStateToProps, (dispatch)=>({
    saveTag: (tag)=>dispatch(saveTag(tag)),
    applyFilters: (tag) => dispatch(applyFilters(tag)),
    destroyTag: (tag, onDelete)=>dispatch(destroyTag(tag, onDelete)),
}))(NotFoundForm)