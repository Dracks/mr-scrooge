import React from 'react'
import { Grommet } from 'grommet'
import { grommet } from 'grommet/themes'
import { BrowserRouter as Router } from 'react-router-dom'

const AllProviders: React.FC<{}> = ({ children }) => {
    return (
            <Router basename="/">
                <Grommet theme={grommet}>{children}</Grommet>
            </Router>
    )
}

export default AllProviders
