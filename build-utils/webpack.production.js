const path = require('path')
const glob = require('glob')
const WebpackMerge = require("webpack-merge");
const PurgecssPlugin = require('purgecss-webpack-plugin');

const prodAndDev = require("./prod-dev");


module.exports.config = () =>
	WebpackMerge(
		{
			mode: "production",
			optimization: {
		    splitChunks: {
		      cacheGroups: {
		        styles: {
		          name: 'styles',
		          test: /\.css$/,
		          chunks: 'all',
		          enforce: true
		        }
		      }
		    }
		  },
		  plugins:[
			  new PurgecssPlugin({
			  	paths: glob.sync(`src/**/*`,  { nodir: true })
		    })
		  ],
			devtool: "eval"
		},
		prodAndDev
	);
