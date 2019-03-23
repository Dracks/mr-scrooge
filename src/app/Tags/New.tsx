import * as React from 'react';
import { connect } from 'react-redux';

import {saveTag} from './Actions';
import Form from './Form';

const New = (props) => {
    return (
        <div>
            <h2> New tag </h2>
            <Form value={{filters: [], children:[]}} {...props} />
        </div>
    )
}

const mapStateToProps = ({hashTags, tags})=>{
    return {
        hashTags,
        tags: tags.data
    }
}

export default connect(mapStateToProps, (dispatch)=>({
    saveTag: (tag)=>dispatch(saveTag(tag)),
}))(New)