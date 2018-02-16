import { applyMiddleware } from 'redux';
import logger from 'redux-logger';

import FetchMiddleware from './network/FetchMiddleware';

export default applyMiddleware(logger, FetchMiddleware)