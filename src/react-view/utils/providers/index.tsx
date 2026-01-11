import { Grommet } from 'grommet';
import React, { PropsWithChildren } from 'react';
import { BrowserRouter } from 'react-router';

import { ProvideApi } from '../../api/client';
import { DEBUG } from '../../constants';
import { MyTheme } from '../grommet.theme';
import { ProvideLogger } from '../logger/logger.context';
import { LogLevel } from '../logger/logger.types';
import { LoggerConsole } from '../logger/logger-console';
import { LoggerUi } from '../logger/logger-ui';
import { SessionProvider } from '../session/session-context';
import { ProvideEventEmitter } from './event-emitter.provider';

const AllProviders: React.FC<PropsWithChildren & { server?: string }> = ({ children, server }) => {
    return (
        <BrowserRouter basename="/">
            <Grommet theme={MyTheme}>
                <ProvideEventEmitter>
                    <ProvideLogger>
                        <ProvideApi server={server}>
                            <SessionProvider>
                                <React.Fragment>
                                    {DEBUG ? <LoggerUi /> : undefined}
                                    <LoggerConsole logLevel={DEBUG ? LogLevel.info : LogLevel.warn} />
                                    {children}
                                </React.Fragment>
                            </SessionProvider>
                        </ProvideApi>
                    </ProvideLogger>
                </ProvideEventEmitter>
            </Grommet>
        </BrowserRouter>
    );
};

export default AllProviders;
