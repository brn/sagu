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


/**
 * Make event handler to Async iteration ready.
 * @param {*} target Event target.
 * @param {string} type Event type.
 * @param {Function} set Callback function that set event.
 * @returns {Function} Magic function that convert event handler to promise.
 */
export function promisifyCallback(target, type, set) {
  const types = Array.isArray(type)? type: [type];
  const buffer = [];

  let resolver = null;
  let disposes = {};

  function getEventHandler(isResolver, type) {
    return e => {
      const diff = isResolver? {event: e, error: null}: {event: null, error: e};
      const o = {...diff, type, dispose: disposes[type]};
      if (isResolver && resolver) {
        resolver(o);
      } else {
        buffer.push(o);
      }
    };
  }

  types.forEach((type, i) => {
    if (!type) {
      return;
    }
    type = type.trim();
    disposes[type] = set(target, type, getEventHandler(true, type), getEventHandler(false, type));
  });

  return () => new Promise(resolve => {
    if (buffer.length) {
      resolve(buffer.shift());
    } else {
      resolver = v => {
        resolver = null;
        resolve(v);
      };
    }
  });
}
