import * as React from 'react'

import RawTableView from '../RawData/RawTableView'

const Content = () =>{
    return (
        <div >
            <RawTableView header={ {"kind":"kind", "tags": "tags", "movement_name": "movement name", "value":"import", "date":"date"} } />
        </div>
    )
}


export default Content;