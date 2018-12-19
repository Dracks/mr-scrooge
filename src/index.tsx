
import { ConnectedRouter } from 'connected-react-router';
import { createBrowserHistory } from 'history';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore } from  'redux';
// import './index.css';

import App from './app/App';
import ResponsiveProvider from "./utils/responsive/Provider";

import middlewares from './middleware'
import reducers from './reducers';

const history = createBrowserHistory()

const store=createStore(reducers(history), middlewares(history))

import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(
    <Provider store={store}>
        <ConnectedRouter history={history}>
            <ResponsiveProvider >
                <App/>
            </ResponsiveProvider>
        </ConnectedRouter>
    </Provider>
    , document.getElementById('root'));
registerServiceWorker();
