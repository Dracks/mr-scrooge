import React, { Component } from 'react';
import { connect } from 'react-redux';

import { eventHandler } from '../Utils'
import Rest from '../../network/Rest'
import WithLoading from "../../network/LoadingHoc";
import ConstantsCss from '../../app/Constants-CSS';
import Loading from '../../components/Loading';
import Input from '../../components/Input';
import Select from '../../components/Select';

import { fetchFiltersTypes } from "./Actions";

const FilterRowEmpty = ({filter, types}) => {
    const options = [{"key":"", "value":"Select"}].concat(Object.keys(types).map((e)=>{ return {"key":e, "value":types[e]}}))
    const save=()=>{
        console.log(filter)
        Rest.save('/api/tag-filter/:id/',filter).then(data=>{
            filter = data;
        })
    }
    return (
        <tr>
            <td><Select options={options} value={filter.type_conditional} onChange={(e)=>{filter.type_conditional=e; save()}}/></td>
            <td><Input value={filter.conditional} onBlur={(e)=>{filter.conditional=e; save()}}/></td>
            <td><a className={ConstantsCss.Button.Delete}> Delete </a></td>
        </tr>
    )
}
const filterRowMapStateToProps = state =>{
    return {
        types: state.filterTypes
    }
}

const FilterRow = connect(filterRowMapStateToProps, {fetchFiltersTypes})(
    WithLoading(FilterRowEmpty,Loading,'types', 'fetchFiltersTypes')
)


class TagsFilterTable extends Component {
    constructor(props){
        super();
        this.create = this.create.bind(this);
        const filters = props.tag.filters;
        if (filters.length>0){
            var ids_list = filters.map(e=>'ids[]='+e)
            this.state = {isLoading:true}
            Rest.get('/api/tag-filter/?'+ids_list.join('&')).then((list)=>{
                this.setState({
                    isLoading: false,
                    isOk: true,
                    data: list
                })
            }, (error)=>{

            })
        } else {
            this.state = {isLoading: false, isOk: true, data: []}
        }
    }
    create(){
        var newData = this.state.data.concat([{tag: this.props.tag.id}])
        console.log(newData)
        this.setState({data: newData})
    }
    render() {
        console.log(this.state);
        if (this.state.isLoading){
            return <Loading />
        } else if (this.state.isOk) {
            let rowsList = this.state.data.map((e)=><FilterRow key={e.id} filter={e}/>)
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