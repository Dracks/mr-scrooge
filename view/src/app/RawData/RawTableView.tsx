import * as moment from 'moment';
import * as React from 'react';
import InfiniteScroll from 'react-infinite-scroller';

import InfiniteScrollHOC from '../../components/list/InfiniteScrollHOC';
import TableView from '../../components/TableView';
import DescriptionCell from './DescriptionCell';
import TagCell from './TagCell';


const RawTableView = ({header, rdsList, selectTagsList, setDescription,  removeTag, addTag, loadMore, hasMore}) =>{
    const data =  rdsList.map(({id, kind, movement_name, tags, value, date, description})=>{
        const setDescriptionFn = (newDescription:string)=>{
            setDescription(id, newDescription)
        }
        return {
            date: moment(date).format("DD-MM-YYYY hh:mm:ss"),
            description: (<DescriptionCell description={description || ""} set={setDescriptionFn}/>),
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