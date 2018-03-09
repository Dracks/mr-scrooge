import React from 'react';
import { connect } from 'react-redux';

import Form from './Form';
import {updateTags} from './Actions';

const New = ({updateTags}) => {
    return <Form value={{filters: []}} updateTags={updateTags} />
}

export default connect(()=>{return {}}, {updateTags})(New)