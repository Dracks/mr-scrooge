import React, { Component } from 'react';

import { eventHandler } from '../../Utils'
import Rest from '../../../network/Rest'
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
        let { fetchFiltersTypes, types } = this.props;
        let filterProps = {fetchFiltersTypes, types}
        if (this.state.isLoading){
            return <Loading />
        } else if (this.state.isOk) {
            let rowsList = this.state.data.map((e)=><FilterRow {...filterProps} key={e.id} filter={e} onDelete={e=>this.getState(this.tag)}/>)
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

export default withLoading(TagsFilterTable, Loading,'types', 'fetchFiltersTypes');