// import './config/webpack.run'

import { ChildProcess, fork } from 'child_process';
import { TscWatchClient } from 'tsc-watch/client';
import webpack from 'webpack';

import WebpackConfig from '../config/webpack.config';

const tsc = new TscWatchClient();

let serverInstance: ChildProcess | undefined;

tsc.on('success', () => {
    console.log('Success');
    if (serverInstance) {
        serverInstance.kill('SIGINT');
    }
    serverInstance = fork('./build/main');
});

tsc.start('--project', './tsconfig.server.json');

WebpackConfig.watch = true;

webpack(WebpackConfig, (err, stats) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log(
        stats?.toString({
            chunks: false, // Makes the build much quieter
            colors: true, // Shows colors in the console
        }),
    );
});

//* /
