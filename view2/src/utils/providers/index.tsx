import React from 'react'
import { Grommet } from 'grommet'
import { BrowserRouter as Router } from 'react-router-dom'
import { MyTheme } from '../grommet.theme'
import {ProvideEventEmitter} from './event-emitter.provider'
import { ProvideLogger } from '../logger/logger.context'
import { LoggerConsole } from '../logger/logger-console'
import { LogLevel } from '../logger/logger.types'
import { LoggerUi } from '../logger/logger-ui'

const AllProviders: React.FC<{}> = ({ children }) => {
    return (
            <Router basename="/">
                <Grommet theme={MyTheme}>
                    <ProvideEventEmitter>
                        <ProvideLogger>
                            <React.Fragment>
                                <LoggerUi/>
                                <LoggerConsole logLevel={LogLevel.info} />
                                {children}
                            </React.Fragment>
                        </ProvideLogger>
                    </ProvideEventEmitter>
                </Grommet>
            </Router>
    )
}

export default AllProviders
