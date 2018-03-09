import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from  'redux';
import { BrowserRouter as Router} from 'react-router-dom';
import './index.css';

import App from './app/App';

import reducers from './reducers';
import middlewares from './middleware'

let store=createStore(reducers, middlewares)

//import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <App dataStatus={{isLoading: false, data:{}}}/>
        </Router>
    </Provider>
    , document.getElementById('root'));
//registerServiceWorker();

