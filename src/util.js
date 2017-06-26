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

import {
  promisifyCallback
} from './_util';


/**
 * Wait specified ms.
 * @param {number} ms Wating time milliseconds.
 * @returns {Promise<*>} 
 */
export async function wait(ms, retval = null) {
  return await new Promise(p => setTimeout(() => p(retval), ms));
}


/**
 * Loop intervals with specified ms.
 * @param {number} time Wating time milliseconds.
 * @param {boolean} skipStart Skip wating first time iteration.
 */
export async function* intervals(time, skipStart = false) {
  let first = true;
  let count = 0;
  while (1) {
    if (first && skipStart) {
      yield count++;
      first = false;
    } else {
      yield await wait(time, count++);
    }
  }
}


/**
 * Infinite value generator.
 * @param {number} start Start value.
 */
export async function* infinity(start = 0) {
  let i = start;
  while (1) {
    yield i++;
  }
}


/**
 * Asify EventEmitter.
 * @param {Object} emitter EventEmitter.
 * @param {string|string[]} type types.
 *
 * @example
 * const emitter = new EventEmitter();
 * for await (const ret of asify.emitter(emitter, 'something')) {
 *   console.log(ret);
 * }
 */
export async function* emitter(emitter, type) {
  const hook = promisifyCallback(emitter, type, (target, type, cb) => {
    emitter.on(type, cb);
    return () => emitter.off(type, cb);
  });
  while (1) {yield hook();}
}
