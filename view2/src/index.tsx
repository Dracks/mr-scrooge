// import './index.scss'

//import { init as initApm } from "@elastic/apm-rum"
import React from 'react'
import ReactDOM from 'react-dom'

import App from './app'
import { APM, ENVIRONMENT, STATIC_URL } from './constants'
import ErrorBoundary from './utils/error-boundary/error-boundary'
import AllProviders from './utils/providers'

// eslint-disable-next-line @typescript-eslint/camelcase
declare let __webpack_public_path__: string
// eslint-disable-next-line
__webpack_public_path__ = STATIC_URL

// Render react
window.onload = (): void => {
    /*initApm({
        environment: ENVIRONMENT,

        pageLoadSampled: APM.pageLoadSampled,
        pageLoadSpanId: APM.pageLoadSpanId,
        pageLoadTraceId: APM.pageLoadTraceId,

        // Set custom APM Server URL (default: http://localhost:8200)
        serverUrl: "https://apm.projecteorbita.cat",
        // Set required service name (allowed characters: a-z, A-Z, 0-9, -, _, and space)
        serviceName: "atomator-ui",
        // Set service version (required for sourcemap feature)
        serviceVersion: APM.version,
    })*/

    ReactDOM.render(
        <AllProviders>
            <ErrorBoundary>
                <App />
            </ErrorBoundary>
        </AllProviders>,
        document.getElementById('body')
    )
}
