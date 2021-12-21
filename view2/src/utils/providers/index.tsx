import React from 'react'
import { Grommet } from 'grommet'
import { BrowserRouter as Router } from 'react-router-dom'
import { MyTheme } from '../grommet.theme'

const AllProviders: React.FC<{}> = ({ children }) => {
    return (
            <Router basename="/">
                <Grommet theme={MyTheme}>{children}</Grommet>
            </Router>
    )
}

export default AllProviders
