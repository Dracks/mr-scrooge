import { routerMiddleware } from 'connected-react-router';
import { applyMiddleware, compose } from 'redux';
import logger from 'redux-logger';

import { fetchMiddleware } from 'redux-api-rest';

const w =(window as any)

const debug = w.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ && 
    w.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) || compose




export default (history:any)=>{
    return debug
        (applyMiddleware(logger, fetchMiddleware as any, routerMiddleware(history)))
}