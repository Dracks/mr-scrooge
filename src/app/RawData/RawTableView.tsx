import * as moment from 'moment';
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import InfiniteScrollHOC from '../../components/list/InfiniteScrollHOC';
import TableView from '../../components/TableView';
import TagCell from './TagCell';


const RawTableView = ({header, rdsList, selectTagsList, removeTag, addTag, loadMore, hasMore}) =>{
    const data =  rdsList.map(({id, kind, movement_name, tags, value, date})=>{
        return {
            date: moment(date).format("DD-MM-YYYY hh:mm:ss"),
            kind,
            movement_name,
            tags: (<TagCell 
                rds={id} 
                selectedTags = {tags}
                {...{selectTagsList, addTag, removeTag}}/>
            ),
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

const InfiniteRawTableView = InfiniteScrollHOC(RawTableView, "rdsList", 10);

export default InfiniteRawTableView;