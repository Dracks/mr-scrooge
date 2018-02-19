import React from 'react'

import RawTableView from '../RawData/RawTableView'

const Content = () =>{
    return (
        <div >
            <RawTableView header={ {"kind":"kind", "movement_name": "movement name", "value":"import"} } />
        </div>
    )
}


export default Content;