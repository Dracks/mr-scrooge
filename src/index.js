import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from  'redux';
import './index.css';

import App from './app/App';

import reducers from './reducers';
import middlewares from './middleware'

let store=createStore(reducers, middlewares)

//import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <Provider store={store}>
        <App />
    </Provider>
    , document.getElementById('root'));
//registerServiceWorker();

