/**
 * @fileoverview
 * @author Taketoshi Aono
 */


// rollup.config.js
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';
import nodeResolve from "rollup-plugin-node-resolve";
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: './src/index.js',
  moduleName: 'sagu',
  format: 'iife',
  plugins: [
    nodeResolve(),
    commonjs(),
    babel({externalHelpers: true}),
    uglify()
  ],
  external: []
};
