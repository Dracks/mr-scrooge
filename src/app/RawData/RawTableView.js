import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import Chip from '../../components/Chip';
import TableView from '../../components/TableView';

const mapStateToProps = state=>{
    let hashTags = {}
    state.tags.data.forEach(element => {
        hashTags[element.id] = element.name;
    });
    return {
        data:  state.allData.data.map(({kind, movement_name, tags, value, date})=>{
            return {
                kind, 
                movement_name,  
                value,
                tags: tags.map((tId)=>hashTags[tId] || null )
                    .filter(e=>e!==null)
                    .map(e=><Chip name={e} />),
                date: moment(date).format("DD-MM-YYYY hh:mm:ss")
            }
        })
    }
}

export default connect(mapStateToProps)(TableView)