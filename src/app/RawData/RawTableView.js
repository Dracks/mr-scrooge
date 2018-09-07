import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';

import { removeTag, addTag } from './Actions';
import Chip from '../../components/Chip';
import Select from '../../components/Select';
import TableView from '../../components/TableView';
import InfiniteScrollHOC from '../../components/list/InfiniteScrollHOC';

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
const RawTableView = ({header, allData, hashTags, allTags, removeTag, addTag, loadMore, hasMore}) =>{
    console.log(header, allData, hashTags, allTags);
    let data =  allData.map(({id, kind, movement_name, tags, value, date})=>{
        return {
            kind, 
            movement_name,  
            value,
            tags: <TagCell rds={id} {...{tags, hashTags, allTags, addTag, removeTag}}/>,
            date: moment(date).format("DD-MM-YYYY hh:mm:ss")
        }
    })
    return (
        <InfiniteScroll
            loadMore={loadMore}
            pageStart={0}
            hasMore={hasMore}>
            <TableView header={header} data={data} />
        </InfiniteScroll>
    )
}

const InfiniteRawTableView = InfiniteScrollHOC(RawTableView, {field: "allData", loadName: "loadMore"}, 10);

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

export default connect(mapStateToProps, mapDispatchToProps)(InfiniteRawTableView)