import React from 'react';
import { connect } from 'react-redux';

import { WithNotFound } from '../../components/NotFound';
import Form from './Form';
import {updateTags} from './Actions';

const NotFoundForm = WithNotFound(Form, 'value');

const Edit = ({tags, match, updateTags}) => {
    var id=parseInt(match.params.id, 10)
    var l=tags.filter((e)=> e.id===id)
    var tag = l[0]
    return (
        <NotFoundForm value={tag} updateTags={updateTags}/>
    )
}

const mapStateToProps = state => {
    return {
        tags: state.tags.data
    }
}

export default connect(mapStateToProps, {updateTags})(Edit)