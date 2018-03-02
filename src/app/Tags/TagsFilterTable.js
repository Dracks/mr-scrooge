import React, { Component } from 'react'

import { eventHandler } from '../Utils'
import Rest from '../../network/Rest'
import ConstantsCss from '../../app/Constants-CSS';
import Loading from '../../components/Loading';
import Input from '../../components/Input';

class FilterRow extends Component{
    constructor(props){
        super(props)
        console.log(props);
        this.state = {
            filter: props.filter,
            status: props.initialEdit ? 'edit' : 'read'
        }

        this.edit = this.edit.bind(this);
    }
    edit(){
        this.setState({status: 'edit'})
    }
    render(){
        let { filter, status } = this.state
        if (status === 'read'){
            return (
                <tr onClick={eventHandler(this.edit)}>
                    <td>{filter.type_conditional}</td>
                    <td>{filter.conditional}</td>
                    <td>{filter.negate_conditional}</td>
                    <td><a className={ConstantsCss.Button.Delete}> Delete </a></td>
                </tr>
                )
        } else {
            return (
                <tr>
                    <td>{filter.type_conditional}</td>
                    <td><Input value={filter.conditional} /></td>
                    <td>{filter.negate_conditional}</td>
                    <td><a className={ConstantsCss.Button.Delete}> Delete </a></td>
                </tr>
                )
        }
    }
}

class TagsFilterTable extends Component {
    constructor(props){
        super();


        this.create = this.create.bind(this);
        var ids_list = props.tag.filters.map(e=>'ids[]='+e)
        this.state = {isLoading:true}
        Rest.get('/api/tag-filter/?'+ids_list.join('&')).then((list)=>{
            this.setState({
                isLoading: false,
                isOk: true,
                data: list
            })
        }, (error)=>{

        })
    }
    create(){

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
                            <th>negate?</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rowsList}
                        <tr>
                            <td colSpan={3}></td>
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