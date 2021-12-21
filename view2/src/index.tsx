import React from 'react'
import ReactDOM from 'react-dom'

import App from './app'
import { STATIC_URL } from './constants'
import ErrorBoundary from './utils/error-boundary/error-boundary'
import AllProviders from './utils/providers'

// eslint-disable-next-line @typescript-eslint/camelcase
declare let __webpack_public_path__: string
// eslint-disable-next-line
__webpack_public_path__ = STATIC_URL

// Render react
window.onload = (): void => {

    ReactDOM.render(
        <AllProviders>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </AllProviders>,
        document.getElementById('body')
    )
}
