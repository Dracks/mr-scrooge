// import './config/webpack.run'

import { fork, ChildProcess } from 'child_process'

import {TscWatchClient} from 'tsc-watch/client'

const tsc = new TscWatchClient()

let serverInstance: ChildProcess | undefined

tsc.on('success', () => {
    console.log('Success')
    if (serverInstance) {
        serverInstance.kill('SIGINT')
    }
    serverInstance = fork('./build/main')
})

tsc.start('--project', './tsconfig.server.json')