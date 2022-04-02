import React from 'react'
import { Grommet } from 'grommet'
import { BrowserRouter as Router } from 'react-router-dom'
import { MyTheme } from '../grommet.theme'
import {ProvideEventEmitter} from './event-emitter.provider'

const AllProviders: React.FC<{}> = ({ children }) => {
    return (
            <Router basename="/">
                <Grommet theme={MyTheme}>
                    <ProvideEventEmitter>
                        {children}
                    </ProvideEventEmitter>
                </Grommet>
            </Router>
    )
}

export default AllProviders
