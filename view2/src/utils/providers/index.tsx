import { Grommet } from 'grommet';
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';

import { DEBUG } from '../../constants';
import { MyTheme } from '../grommet.theme';
import { ProvideLogger } from '../logger/logger.context';
import { LogLevel } from '../logger/logger.types';
import { LoggerConsole } from '../logger/logger-console';
import { LoggerUi } from '../logger/logger-ui';
import { ProvideEventEmitter } from './event-emitter.provider';

const AllProviders: React.FC<{}> = ({ children }) => {
    return (
        <Router basename="/">
            <Grommet theme={MyTheme}>
                <ProvideEventEmitter>
                    <ProvideLogger>
                        <React.Fragment>
                            {DEBUG ? <LoggerUi /> : undefined}
                            <LoggerConsole logLevel={DEBUG ? LogLevel.info : LogLevel.warn} />
                            {children}
                        </React.Fragment>
                    </ProvideLogger>
                </ProvideEventEmitter>
            </Grommet>
        </Router>
    );
};

export default AllProviders;
