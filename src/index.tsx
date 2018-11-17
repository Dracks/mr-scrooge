
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router} from 'react-router-dom';
import { createStore } from  'redux';
// import './index.css';

import App from './app/App';
import ResponsiveProvider from "./utils/responsive/Provider";

import middlewares from './middleware'
import reducers from './reducers';

const store=createStore(reducers, middlewares)

import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <Provider store={store}>
        <Router>
            <ResponsiveProvider >
                <App/>
            </ResponsiveProvider>
        </Router>
    </Provider>
    , document.getElementById('root'));
registerServiceWorker();
