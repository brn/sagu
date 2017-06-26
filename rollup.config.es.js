/**
 * @fileoverview
 * @author Taketoshi Aono
 */


import config from './rollup.config.js';

config.format = 'es';
config.plugins.pop(); // Uglify not support es6 modules.

export default config;
