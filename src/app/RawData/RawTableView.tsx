import * as moment from 'moment';
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';
import { connect } from 'react-redux';

import InfiniteScrollHOC from '../../components/list/InfiniteScrollHOC';
import TableView from '../../components/TableView';
import { addTag, removeTag } from './Actions';
import TagCell from './TagCell';


const RawTableView = ({header, allData, allTags, removeTagFn, addTagFn, loadMore, hasMore}) =>{
    const data =  allData.map(({id, kind, movement_name, tags, value, date})=>{
        return {
            date: moment(date).format("DD-MM-YYYY hh:mm:ss"),
            kind,
            movement_name,
            tags: <TagCell rds={id} {...{tags, allTags, addTag: addTagFn, removeTag: removeTagFn}}/>,
            value,
        }
    })
    return (
        <InfiniteScroll
            loadMore={loadMore}
            pageStart={0}
            hasMore={hasMore}>
            <TableView data={data} header={header}/>
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
        addTagFn: (data, tag)=>{dispatch(addTag(data, tag))},
        removeTagFn: (data, tag)=>{dispatch(removeTag(data, tag))},
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(InfiniteRawTableView)