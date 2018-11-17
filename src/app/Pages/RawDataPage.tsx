import * as React from 'react'
import { connect } from 'react-redux';

import MySelect from '../../components/Select';
import RawTableView from '../RawData/RawTableView'

import { IStoreType } from '../../reducers';
import { ACTIONS } from '../RawData/Reducers';

const Tags = (tags, current, onChange)=>()=> (
    <div>
        Tags
        <MySelect 
            onChangeFn={onChange}
            options={tags.map(t=>({key:t.id, value: t.name}))} 
            placeholder="Filter" 
            value={current} 
            />
    </div>
)

const Content = ({tags, filters, setTagFilter}) =>{
    /* tslint:disable-next-line */
    console.log(tags)
    return (
        <div >
            <RawTableView 
            header={ {
                "kind":"kind", 
                "tags": Tags(tags, filters.tagFilter, setTagFilter), 
                "movement_name": "movement name", 
                "value":"import", 
                "date":"date"} } 
                />
        </div>
    )
}

const mapStateToProps = (state:IStoreType)=>({
    filters: state.rawDataView,
    tags: state.tags, 
})

const mapDispatchToProps = {
    setTagFilter : ACTIONS.filterTag
}
const connection = connect(mapStateToProps, mapDispatchToProps)


export default connection(Content);