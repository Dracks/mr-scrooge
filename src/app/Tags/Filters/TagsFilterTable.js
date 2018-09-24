import React, { Component } from 'react';

import { withLoading } from 'react-redux-rest';

import { eventHandler } from '../../Utils'
import ConstantsCss from '../../Constants-CSS';
import Loading from '../../../components/Loading';

import { Primary } from '../../../components/dessign/buttons';
import { Add } from '../../../components/dessign/icons';

import FilterRow from './FilterRow';

class TagsFilterTable extends Component {
    constructor(props){
        super(props);
        this.create = this.create.bind(this);
        this.state = {
            new: null
        }
    }

    componentWillReceiveProps(newProps){
        if (this.props !== newProps ){
            this.setState({new:null});
        }
    }

    create(){
        var newData = {tag: this.props.tag.id}
        this.setState({new: newData})
    }
    render() {
        let { types, filtersList, saveFilter, deleteFilter } = this.props;
        let filterProps = { types, saveFilter, deleteFilter }
        
        let rowsList = filtersList
            .map((e, index)=><FilterRow 
                {...filterProps} 
                key={index} 
                filter={e}/>)
        
        let add;
        if (this.state.new === null){
            add = <tr>
                <td colSpan={2}></td>
                <td>
                    <Primary shape="circle" onClick={eventHandler(this.create)}><Add /></Primary>
                </td>
            </tr>
        } else {
            add = <FilterRow
                key="new"
                filter={this.state.new}
                {...{
                    types,
                    saveFilter: (f)=>{this.setState(Object.assign({},f)); saveFilter(f)},
                    deleteFilter:()=>this.setState({new:null})
                }}
                />
        }
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
                    {add}
                </tbody>
            </table>
        )
    }
}

export default withLoading(TagsFilterTable, Loading,'isLoading', 'loadFilters');