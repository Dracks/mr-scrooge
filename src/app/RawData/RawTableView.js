import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { removeTag } from './Actions';
import Chip from '../../components/Chip';
import TableView from '../../components/TableView';

const RawTableView = ({header, allData, hashTags, removeTag, addTag}) =>{
    let data =  allData.map(({id, kind, movement_name, tags, value, date})=>{
        return {
            kind, 
            movement_name,  
            value,
            tags: tags.map((tId)=>hashTags[tId] || null )
                .filter(e=>e!==null)
                .map(e=><Chip name={e.name} onClick={()=>removeTag(id, e.id)}/>),
            date: moment(date).format("DD-MM-YYYY hh:mm:ss")
        }
    })
    return <TableView header={header} data={data} />
}

const mapStateToProps = ({allData, hashTags})=>{
    return {
        allData: allData.data,
        hashTags,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addTag: (data, tag)=>{console.log(data); console.log(tag)},
        removeTag: (data, tag)=>{dispatch(removeTag(data, tag))},
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RawTableView)