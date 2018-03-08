import React from 'react';
import { connect } from 'react-redux';

import Form from './Form';

const Edit = ({tags, match}) => {
    var id=parseInt(match.params.id, 10)
    var l=tags.filter((e)=> e.id===id)
    var tag = l[0]
    
    return (
        <Form value={tag} />
    )
}

const mapStateToProps = state => {
    return {
        tags: state.tags.data
    }
}
export default connect(mapStateToProps)(Edit)