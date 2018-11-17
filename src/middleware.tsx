import { applyMiddleware } from 'redux';
import logger from 'redux-logger';

import { fetchMiddleware } from 'redux-api-rest';

export default applyMiddleware(logger, fetchMiddleware as any)