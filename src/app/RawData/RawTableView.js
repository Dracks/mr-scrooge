import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import { removeTag, addTag } from './Actions';
import Chip from '../../components/Chip';
import Select from '../../components/Select';
import TableView from '../../components/TableView';

const TagCell = ({tags, rds, hashTags, allTags, removeTag, addTag})=>{
    
    var tagsList = tags.map((tId)=>hashTags[tId] || null )
        .filter(e=>e!==null)
        .map(e=><Chip name={e.name} onClick={()=>removeTag(rds, e.id)}/>)
    var listSelect = [{key: '', value:'Select'}].concat(
        allTags.map((e)=>{return {key: e.id, value: e.name}})
    );
    return (
        <div>
            <div>
                <Select options={listSelect} onChange={(e)=>{addTag(rds, e)}}/>
            </div>
            {tagsList}
        </div>
        )
}
const RawTableView = ({header, allData, hashTags, allTags, removeTag, addTag}) =>{
    let data =  allData.map(({id, kind, movement_name, tags, value, date})=>{
        return {
            kind, 
            movement_name,  
            value,
            tags: <TagCell rds={id} {...{tags, hashTags, allTags, addTag, removeTag}}/>,
            date: moment(date).format("DD-MM-YYYY hh:mm:ss")
        }
    })
    return <TableView header={header} data={data} />
}

const mapStateToProps = ({allData, hashTags, tags})=>{
    return {
        allData: allData.data,
        hashTags,
        allTags: tags.data,
    }
}

const mapDispatchToProps = (dispatch) => {
    return {
        addTag: (data, tag)=>{dispatch(addTag(data, tag))},
        removeTag: (data, tag)=>{dispatch(removeTag(data, tag))},
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(RawTableView)