import React, { Component } from 'react';

import { eventHandler } from '../../Utils'
import ConstantsCss from '../../Constants-CSS';
import Loading from '../../../components/Loading';

import { Primary } from '../../../components/dessign/buttons';
import { Add } from '../../../components/dessign/icons';

import FilterRow from './FilterRow';
import withLoading from '../../../network/LoadingHoc';

class TagsFilterTable extends Component {
    constructor(props){
        super(props);
        this.create = this.create.bind(this);
        this.state = {
            new: []
        }
    }

    componentWillReceiveProps(newProps){
        if (this.props !== newProps ){
            this.setState({new:[]});
        }
    }

    create(){
        var newData = [{tag: this.props.tag.id}]
        this.setState({new: newData})
    }
    render() {
        let { types, filtersList } = this.props;
        let filterProps = { types}
        
        let rowsList = filtersList
            .concat(this.state.new)
            .map((e, index)=><FilterRow 
                {...filterProps} 
                key={index} 
                filter={e} 
                onDelete={e=>e}/>)
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
    }
}

export default withLoading(TagsFilterTable, Loading,'isLoading', 'loadFilters');