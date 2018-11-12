import * as React from 'react';
import { connect } from 'react-redux';
import * as moment from 'moment';
import InfiniteScroll from 'react-infinite-scroller';

import { removeTag, addTag } from './Actions';
import TagCell from './TagCell';
import TableView from '../../components/TableView';
import InfiniteScrollHOC from '../../components/list/InfiniteScrollHOC';


const RawTableView = ({header, allData, allTags, removeTag, addTag, loadMore, hasMore}) =>{
    let data =  allData.map(({id, kind, movement_name, tags, value, date})=>{
        return {
            kind, 
            movement_name,  
            value,
            tags: <TagCell rds={id} {...{tags, allTags, addTag, removeTag}}/>,
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

const InfiniteRawTableView = InfiniteScrollHOC(RawTableView, "allData", 10);

const mapStateToProps = ({allData, tags})=>{
    return {
        allData: allData.data,
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