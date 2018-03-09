import React, { Component } from 'react';
import { connect } from 'react-redux';

import { eventHandler } from '../Utils'
import Rest from '../../network/Rest'
import WithLoading from "../../network/LoadingHoc";
import ConstantsCss from '../../app/Constants-CSS';
import Loading, {TableLoading }from '../../components/Loading';
import Input from '../../components/Input';
import Select from '../../components/Select';

import { fetchFiltersTypes } from "./Actions";

const FilterRowEmpty = ({filter, types, onDelete}) => {
    const options = [{"key":"", "value":"Select"}].concat(Object.keys(types).map((e)=>{ return {"key":e, "value":types[e]}}))
    const save=()=>{
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
            <td><Select options={options} value={filter.type_conditional} onChange={(e)=>{filter.type_conditional=e; save()}}/></td>
            <td><Input value={filter.conditional} onBlur={(e)=>{filter.conditional=e; save()}}/></td>
            <td><a className={ConstantsCss.Button.Delete} onClick={eventHandler(deleteRow)}> Delete </a></td>
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
                <table className={ConstantsCss.Table.Striped}>
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
                                <a className={ConstantsCss.Button.Normal} onClick={eventHandler(this.create)}>Create</a>
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