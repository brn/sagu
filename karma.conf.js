/**
 * The MIT License (MIT)
 * Copyright (c) Taketoshi Aono(brn)
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 * @fileoverview 
 * @author Taketoshi Aono(brn)
 */


const pkg = require('./package');
const sse = require('sse-express');
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const app = express();

module.exports = config => {
  const server = http.Server(app);
  const fs = require('fs');
  app.get('/sse', sse, (req, res) => {
    const a = setInterval(() => {
      res.sse('test', {key: 'test'});
    }, 100);
    req.on('close', () => clearInterval(a));
  });
  let counter = 1;
  app.get('/failed', (req, res) => {
    if ((counter++ % 5) !== 0) {
      res.writeHead(500, {
        'access-control-allow-origin': '*'
      });
      res.end(JSON.stringify({key: 'failed'}));
    } else {
      res.writeHead(200, {
        'access-control-allow-origin': '*'
      });
      res.end(JSON.stringify({key: 'success'}));
    }
  });
  app.get('/binary-stream', (req, res) => {
    res.writeHead(200, {
      'access-control-allow-origin': '*'
    });
    fs.createReadStream('./binary').pipe(res);
  });
  app.get('/json-stream', (req, res) => {
    res.writeHead(200, {
      'content-type': 'application/json',
      'access-control-allow-origin': '*'
    });
    fs.createReadStream('./examples.json').pipe(res);
  });
  const io = socketIO(server);
  io.on('connection', socket => {
    const a = setInterval(() => {
      socket.emit('request', {key: 'test'});
    }, 100);
    socket.on('close', () => clearInterval(a));
  });
  server.listen(9877);
  
  config.set({
    plugins: [
      "karma-mocha",
      "karma-chrome-launcher",
      "karma-phantomjs-launcher",
      "karma-source-map-support",
      'karma-sourcemap-loader',
      "karma-mocha-reporter",
      "karma-rollup-preprocessor"
    ],
    files: [
      {pattern: './node_modules/babel-polyfill/dist/polyfill.js'},
      {pattern: './src/**/__tests__/**/*.spec.js'}
    ],
    mochaReporter: {
      showDiff: true
    },
    usePolling: false,
    browserNoActivityTimeout: 15000,
    frameworks: ["mocha"],
    reporters: ["mocha"],
    preprocessors: {
      'src/**/*.js': ["rollup"],
      'src/**/*.json': ["rollup"]
    },
    customLaunchers: {
      ChromeHeadless: {
        base: 'Chrome',
        flags: ['--headless', '--disable-gpu', '--remote-debugging-port=9222']
      }
    },
    client: {
      captureConsole: true
    },
    browserConsoleLogOptions: {
      level: 'log',
      format: '%b %T: %m',
      terminal: true
    },
    rollupPreprocessor: {
			plugins: [
        require('rollup-plugin-json')({          
          // for tree-shaking, properties will be declared as
          // variables, using either `var` or `const`
          preferConst: true, // Default: false

          // specify indentation for the generated default export —
          // defaults to '\t'
          indent: '  '
        }),
        require('rollup-plugin-node-resolve')({
          jsnext: true,
          main: true,
          builtins: false,
          browser: true,
          extensions: [
            '.js',
            '.json'
          ]
        }),
        require('rollup-plugin-commonjs')({
          include: 'node_modules/**',
          extensions: [
            '.js',
            ".json"
          ],
          namedExports: {
            'node_modules/chai/index.js': ['expect', 'should' ],
            'node_modules/socket.io-client/index.js': ['io']
          }
        }),
				require('rollup-plugin-babel')()
			],
			format: 'iife',               // Helps prevent naming collisions.
			moduleName: 'sagu', // Required for 'iife' format.
			sourceMap: 'inline'          // Sensible for testing.
		}
  });
};
