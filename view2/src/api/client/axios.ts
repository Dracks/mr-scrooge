import Axios from 'axios';
import applyCaseMiddleware from 'axios-case-converter';
import { configure } from 'axios-hooks';

const axios = applyCaseMiddleware(
    Axios.create({
        baseURL: '/api',
        withCredentials: true,
        // `xsrfCookieName` is the name of the cookie to use as a value for xsrf token
        xsrfCookieName: 'csrftoken', // default

        // `xsrfHeaderName` is the name of the http header that carries the xsrf token value
        xsrfHeaderName: 'X-CSRFToken', // default
    }),
);

configure({ axios });
