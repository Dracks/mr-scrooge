import { Input } from 'antd';
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

const Name = (current, onChange) => ()=>(
    <div>
        Movement name
        <Input
            style={{width:"100%"}}
            placeholder="Filter"
            value={current}
            onChange = {onChange}
            />
    </div>
)

const Content = ({selectTagsList, filters, rdsList, setNameFilter, setTagFilter, addTagFn, removeTagFn}) =>{
    return (
        <div >
            <RawTableView
            header={ {
                "kind":"kind",
                "tags": Tags(selectTagsList, filters.tagFilter, setTagFilter),
                "movement_name": Name(filters.nameFilter, setNameFilter),
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

const getFilteredData=({tagFilter, nameFilter}: IRawDataState, data: IRawData[])=>{
    let ret = data;
    if (tagFilter){
        ret = ret.filter((e)=>e.tags.indexOf(tagFilter)!==-1)
    }

    if (nameFilter && nameFilter.length>0){
        const name = nameFilter.toUpperCase()
        ret = ret.filter(e=>e.movement_name.toUpperCase().indexOf(name)!==-1)
    }

    return ret
}

const mapStateToProps = ({rawDataView, tags, allData}:IStoreType)=>({
    filters: rawDataView,
    tagsList:tags.data,
    rdsList: getFilteredData(rawDataView, allData.data),
    selectTagsList: tags.data.map(t=>({key:t.id, value: t.name})),
})

const mapDispatchToProps = addDispatch({
    addTagFn: TagActions.add,
    setNameFilter: (e)=>ACTIONS.filterName(e.target.value),
    setTagFilter : ACTIONS.filterTag,
    removeTagFn: TagActions.remove,
})

const connection = connect(mapStateToProps, mapDispatchToProps)


export default connection(Content);