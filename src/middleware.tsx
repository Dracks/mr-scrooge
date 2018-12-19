import { routerMiddleware } from 'connected-react-router';
import { applyMiddleware } from 'redux';
import logger from 'redux-logger';

import { fetchMiddleware } from 'redux-api-rest';

export default (history)=>applyMiddleware(logger, fetchMiddleware as any, routerMiddleware(history))