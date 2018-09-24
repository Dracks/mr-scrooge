import { applyMiddleware } from 'redux';
import logger from 'redux-logger';

import { fetchMiddleware } from 'react-redux-rest';

export default applyMiddleware(logger, fetchMiddleware)