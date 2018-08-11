import React from 'react';
import { connect } from 'react-redux';

import { WithNotFound } from '../../components/NotFound';
import Form from './Form';
import {updateTags} from './Actions';
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

const Edit = ({tags, match, updateTags, hashTags}) => {
    var id=parseInt(match.params.id, 10)
    var l=tags.filter((e)=> e.id===id)
    var tag = l[0]
    return (
        <NotFoundForm value={tag} {...{updateTags, hashTags, tags}}/>
    )
}

const mapStateToProps = ({tags, hashTags}) => {
    return {
        tags: tags.data,
        hashTags
    }
}

export default connect(mapStateToProps, {updateTags})(Edit)