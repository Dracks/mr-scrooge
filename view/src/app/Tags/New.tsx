import { push } from 'connected-react-router';
import * as React from 'react';
import { connect } from 'react-redux';
import { MetaData } from 'redux-api-rest';

import {saveTag} from './Actions';
import Form from './Form';

const New = (props) => {
    return (
        <div>
            <h2> New tag </h2>
            <Form value={{filters: [], children:[], negate_conditional:false, parent:null}} {...props} />
        </div>
    )
}

const mapStateToProps = ({hashTags, tags})=>{
    return {
        hashTags,
        tags: tags.data
    }
}

export default connect(mapStateToProps, (dispatch, props: any)=>({
    saveTag: (tag)=>dispatch(saveTag(tag, (meta:MetaData, data)=>!meta.isLoading && data && push(props.basepath+data.id))),
}))(New)