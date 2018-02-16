import React from 'react'

//import TableView from '../components/TableView'
import RawTableView from './RawData/RawTableView'

const Content = () =>{
    return (
        <div >
            <RawTableView header={ {"kind":"kind", "movement_name": "movement name", "value":"import"} } />
        </div>
    )
}


export default Content;