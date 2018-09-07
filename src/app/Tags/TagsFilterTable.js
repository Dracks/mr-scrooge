import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input } from 'antd';

import { eventHandler, debugLambda } from '../Utils'
import Rest from '../../network/Rest'
import WithLoading from "../../network/LoadingHoc";
import ConstantsCss from '../../app/Constants-CSS';
import Loading, {TableLoading }from '../../components/Loading';
import Select from '../../components/Select';

import { fetchFiltersTypes } from "./Actions";
import { Primary, Danger } from '../../components/dessign/buttons';
import { Add } from '../../components/dessign/icons';

const FilterRowEmpty = ({filter, types, onDelete}) => {
    console.log(filter);
    const options = Object.keys(types).map((e)=>{ return {"key":e, "value":types[e]}})
    const save=()=>{
        console.log(filter);
        Rest.save('/api/tag-filter/:id/',filter).then(data=>{
            filter = data;
        })
    }
    const deleteRow=()=>{
        Rest.destroy('/api/tag-filter/:id/', filter).then((data)=>{
            console.log(data);
            onDelete(filter);
        })
    }
    return (
        <tr>
            <td><Select options={options} placeholder="Select" value={filter.type_conditional} onChangeFn={debugLambda((e)=>{filter.type_conditional=e; save()})} style={{width:"100%"}}/></td>
            <td><Input defaultValue={filter.conditional} onBlur={debugLambda((e)=>{filter.conditional=e.target.value; save()})}/></td>
            <td><Danger onClick={eventHandler(deleteRow)}> Delete </Danger></td>
        </tr>
    )
}
const filterRowMapStateToProps = state =>{
    return {
        types: state.filterTypes
    }
}

const FilterRow = connect(filterRowMapStateToProps, {fetchFiltersTypes})(
    WithLoading(FilterRowEmpty,TableLoading(3),'types', 'fetchFiltersTypes')
)


class TagsFilterTable extends Component {
    constructor(props){
        super();
        this.create = this.create.bind(this);
        this.state = this.getState(props.tag)
    }

    componentWillReceiveProps(newProps){
        if (this.props !== newProps ){
            this.setState(this.getState(newProps.tag));
        }
    }

    getState(tag){
        this.tag = tag;
        Rest.get('/api/tag-filter/?tag='+tag.id).then((list)=>{
            this.setState({
                isLoading: false,
                isOk: true,
                data: list
            })
        }, (error)=>{

        })
        return {isLoading:true};
    }

    create(){
        var newData = this.state.data.concat([{tag: this.props.tag.id}])
        this.setState({data: newData})
    }
    render() {
        if (this.state.isLoading){
            return <Loading />
        } else if (this.state.isOk) {
            let rowsList = this.state.data.map((e)=><FilterRow key={e.id} filter={e} onDelete={e=>this.getState(this.tag)}/>)
            return (
                <table className={ConstantsCss.Table.Striped} style={{width:"100%"}}>
                    <thead>
                        <tr>
                            <th>type</th>
                            <th>condition</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rowsList}
                        <tr>
                            <td colSpan={2}></td>
                            <td>
                                <Primary shape="circle" onClick={eventHandler(this.create)}><Add /></Primary>
                            </td>
                        </tr>
                    </tbody>
                </table>
            )
        } else {
            return <div > Something bad </div>
        }
    }
}

export default TagsFilterTable;