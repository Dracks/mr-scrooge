import * as React from 'react'
import { connect } from 'react-redux';

import MySelect, { IPairData } from '../../components/Select';
import RawTableView from '../RawData/RawTableView'

import { IRawData } from 'src/types/data';
import addDispatch from 'src/utils/redux/AddDispatch';
import { IStoreType } from '../../reducers';
import { TagActions} from '../RawData/Actions';
import { ACTIONS, IRawDataState } from '../RawData/reducer';

/* tslint:disable object-literal-sort-keys */

const Tags = (tags: IPairData[], current, onChange)=>()=> (
    <div>
        Tags
        <MySelect 
            onChangeFn={onChange}
            options={tags} 
            placeholder="Filter" 
            value={current}
            style={{width:"100%"}}
            />
    </div>
)

const Content = ({selectTagsList, filters, rdsList, setTagFilter, addTagFn, removeTagFn}) =>{
    return (
        <div >
            <RawTableView 
            header={ {
                "kind":"kind", 
                "tags": Tags(selectTagsList, filters.tagFilter, setTagFilter), 
                "movement_name": "movement name", 
                "value":"import", 
                "date":"date"} } 
            addTag = {addTagFn}
            removeTag = {removeTagFn}
            { ...{ 
                selectTagsList,
                rdsList,
            }}
                />
        </div>
    )
}

const getFilteredData=({tagFilter}: IRawDataState, data: IRawData[])=>{
    let filterLambda = (_:IRawData)=>true
    if (tagFilter){
        filterLambda = (e)=>e.tags.indexOf(tagFilter)!==-1
    }

    return data.filter(filterLambda)
}

const mapStateToProps = ({rawDataView, tags, allData}:IStoreType)=>({
    filters: rawDataView,
    tagsList:tags.data,
    rdsList: getFilteredData(rawDataView, allData.data),
    selectTagsList: tags.data.map(t=>({key:t.id, value: t.name})), 
})

const mapDispatchToProps = addDispatch({
    addTagFn: TagActions,
    setTagFilter : ACTIONS.filterTag,
    removeTagFn: TagActions.remove,
})

const connection = connect(mapStateToProps, mapDispatchToProps)


export default connection(Content);