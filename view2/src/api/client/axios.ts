import Axios from 'axios'
import applyCaseMiddleware from 'axios-case-converter';
import { configure } from 'axios-hooks'

const axios = applyCaseMiddleware(Axios.create({
    baseURL: '/api'
}))

configure({axios})
