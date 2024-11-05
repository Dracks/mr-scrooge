/* eslint-disable no-console */
// import { ChildProcess, fork } from "child_process";
// import { TscWatchClient } from "tsc-watch/client";
import webpack from "webpack";

import WebpackConfig from "../config/webpack5.config";
/*
const tsc = new TscWatchClient();

// eslint-disable-next-line init-declarations
let serverInstance: ChildProcess | undefined;

tsc.on('success', () => {
    console.log('Success');
    if (serverInstance) {
        serverInstance.kill('SIGINT');
    }
    serverInstance = fork('./build/main');
});

tsc.start('--project', './tsconfig.server.json');
*/
WebpackConfig.watch = true;
WebpackConfig.mode = 'development'

webpack(WebpackConfig, (err, stats) => {
    if (err) {
        console.log(err);
        return;
    }

    console.log(
        stats?.toString({
            // Makes the build much quieter
            chunks: false,
            // Shows colors in the console
            colors: true,
        }),
    );
});
