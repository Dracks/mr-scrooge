/* eslint-disable multiline-comment-style */
/* eslint-disable no-console */
import Bun from 'bun'
import { ChildProcess, fork } from 'child_process';
import { TscWatchClient } from 'tsc-watch/client';
import webpack from 'webpack';

import WebpackConfig from '../config/webpack.config';

//const tsc = new TscWatchClient();

// eslint-disable-next-line init-declarations
let serverInstance: ChildProcess | undefined;
/*
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

// eslint-disable-next-line spaced-comment
/*/

import Bun from 'bun'
import path from 'path'

const root = path.join(__dirname, '..');

(async ()=>{

    const buildView = await Bun.build({
        entrypoints: ["./src/view/index.tsx"],
        minify: true,
        outdir: "./static/react/",
        plugins: [  ],
        root,
    });

    console.log(buildView)
    
})()
// */
