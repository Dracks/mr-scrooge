var webpack = require("webpack");

const config = require(__dirname+'/webpack.config.js')
config.watch = true
webpack(config, (err, stats) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log(stats.toString({
      chunks: false,  // Makes the build much quieter
      colors: true    // Shows colors in the console
    }))
})