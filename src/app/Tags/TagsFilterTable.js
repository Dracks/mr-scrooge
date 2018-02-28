import React, { Component } from 'react'

import { eventHandler } from '../Utils'
import ConstantsCss from '../../app/Constants-CSS';

class TagsFilterTable extends Component {
    constructor(props){
        super();

        this.create = this.create.bind(this);
    }
    create(){

    }
    render() {
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
                    <tr>
                        <td colSpan={3}></td>
                        <td>
                            <a className={ConstantsCss.Button.Normal} onClick={eventHandler(this.create)}>Create</a>
                        </td>
                    </tr>
                </tbody>
            </table>
        )
    }
}

export default TagsFilterTable;