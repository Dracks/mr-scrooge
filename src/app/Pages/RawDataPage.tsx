import { Input } from 'antd';
import * as React from 'react'
import { connect } from 'react-redux';

import MySelect, { IPairData, MyMultipleSelect } from '../../components/Select';
import RawTableView from '../RawData/RawTableView'

import { IRawData } from 'src/types/data';
import addDispatch from 'src/utils/redux/AddDispatch';
import { selectFilterByContents } from 'src/utils/Select';
import { IStoreType } from '../../reducers';
import { RawDataActions, TagActions } from '../RawData/Actions';
import { ACTIONS, IRawDataState } from '../RawData/reducer';

/* tslint:disable object-literal-sort-keys */
const KindHead = (kindsList: IPairData[], current, onChange)=> ()=>(
    <div>
        kind
        <MySelect
            onChangeFn={onChange}
            options={kindsList}
            placeholder="Filter"
            value={current}
            style={{width:"100%"}}
            />
    </div>
)
const Tags = (tags: IPairData[], current, onChange)=>()=> (
    <div>
        Tags
        <MyMultipleSelect
            onChangeFn={onChange}
            options={tags}
            placeholder="Filter"
            value={current}
            filterOption={selectFilterByContents}
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

const Content = ({fileKindsList, selectTagsList, filters, rdsList, setKindFilter, setNameFilter, setTagFilter, setDescription, addTagFn, removeTagFn}) =>{
    return (
        <div >
            <RawTableView
            header={ {
                "kind":KindHead(fileKindsList, filters.kindFilter, setKindFilter),
                "tags": Tags(selectTagsList, filters.tagFilter, setTagFilter),
                "movement_name": Name(filters.nameFilter, setNameFilter),
                "value":"import",
                "date":"date",
                "description": "Description"
            } }
            addTag = {addTagFn}
            removeTag = {removeTagFn}
            { ...{
                selectTagsList,
                rdsList,
                setDescription,
            }}
                />
        </div>
    )
}

const getFilteredData=({tagFilter, nameFilter, kindFilter}: IRawDataState, data: IRawData[])=>{
    let ret = data;
    if (kindFilter){
        ret = ret.filter(e=>e.kind === kindFilter)
    }
    if (tagFilter && tagFilter.length>0){
        ret = ret.filter(e=>tagFilter.reduce((ac, tag)=> ac && e.tags.indexOf(tag)!==-1, true))
    }

    if (nameFilter && nameFilter.length>0){
        const name = nameFilter.toUpperCase()
        ret = ret.filter(e=>e.movement_name.toUpperCase().indexOf(name)!==-1)
    }

    return ret
}

const mapStateToProps = ({rawDataView, tags, allData, importFileKinds}:IStoreType)=>({
    filters: rawDataView,
    tagsList:tags.data,
    fileKindsList: [ {key:undefined, value: "All"}, ...(importFileKinds as any).data.map(({key})=>({key, value:key}))],
    rdsList: getFilteredData(rawDataView, allData.data),
    selectTagsList: tags.data.map(t=>({key:t.id, value: t.name})),
})

const mapDispatchToProps = addDispatch({
    addTagFn: TagActions.add,
    setDescription: RawDataActions.setDescription,
    setNameFilter: (e)=>ACTIONS.filterName(e.target.value),
    setKindFilter: (e)=>ACTIONS.filterKind(e),
    setTagFilter : ACTIONS.filterTag,
    removeTagFn: TagActions.remove,
})

const connection = connect(mapStateToProps, mapDispatchToProps)


export default connection(Content);