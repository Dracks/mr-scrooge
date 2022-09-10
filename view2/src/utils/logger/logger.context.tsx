import React from "react"
import EventEmitter from 'events'

import { ILogger } from "./logger.types"
import { Logger } from './logger.class'

interface LoggerContext {
    logger: ILogger,
    eventEmitter: EventEmitter
}

const loggerEmitter = new EventEmitter()

const loggerContext = React.createContext<LoggerContext>({
    logger: new Logger(loggerEmitter),
    eventEmitter: loggerEmitter
})

export const useLogger = ()=>React.useContext(loggerContext).logger
export const useLoggerEmitter = ()=>React.useContext(loggerContext).eventEmitter

interface LoggerProvider {
    //useConsole?: boolean
}

export const ProvideLogger : React.FC<LoggerProvider> = ({children})=>{
    const {Provider} = loggerContext
    const logger = new Logger(loggerEmitter)

    return <Provider value={{logger, eventEmitter: loggerEmitter}}>
        {children}
    </Provider>
}
