import React from 'react';
import { connect } from 'react-redux';

import Form from './Form';
import {updateTags} from './Actions';

const Edit = ({tags, match, updateTags}) => {
    var id=parseInt(match.params.id, 10)
    var l=tags.filter((e)=> e.id===id)
    var tag = l[0]
    
    return (
        <Form value={tag} updateTags={updateTags}/>
    )
}

const mapStateToProps = state => {
    return {
        tags: state.tags.data
    }
}

export default connect(mapStateToProps, {updateTags})(Edit)