import * as React from 'react';
import { Component } from 'react';

import { withLoading } from 'redux-api-rest-hocs';

import Loading from '../../../components/network/Loading';
import { eventHandler } from '../../Utils'

import { Primary } from '../../../components/dessign/buttons';
import { Add } from '../../../components/dessign/icons';

import FilterRow from './FilterRow';

class TagsFilterTable extends Component<any, any> {
    constructor(props){
        super(props);
        this.create = this.create.bind(this);
        this.state = {
            new: null
        }
    }

    public componentWillReceiveProps(newProps){
        if (this.props !== newProps ){
            this.setState({new:null});
        }
    }

    public create(){
        const newData = {tag: this.props.tag.id}
        this.setState({new: newData})
    }
    public render() {
        const { types, filtersList, saveFilter, deleteFilter } = this.props;
        const filterProps = { types, saveFilter, deleteFilter }

        const rowsList = filtersList
            .map((e, index)=><FilterRow
                {...filterProps}
                key={index}
                filter={e}/>)

        let add;
        if (this.state.new === null){
            add = <tr>
                <td colSpan={2}/>
                <td>
                    <Primary shape="circle" onClick={eventHandler(this.create)}><Add /></Primary>
                </td>
            </tr>
        } else {
            add = <FilterRow
                key="new"
                filter={this.state.new}
                {...{
                    deleteFilter:()=>this.setState({new:null}),
                    saveFilter: (f)=>{this.setState(Object.assign({},f)); saveFilter(f)},
                    types,
                }}
                />
        }
        return (
            <table style={{width:"100%"}}>
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