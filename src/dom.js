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


// https://developer.mozilla.org/ja/docs/Web/API/Element/matches
const MATCH = Element.prototype.matches ||
        Element.prototype.matchesSelector || 
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector || 
        Element.prototype.oMatchesSelector || 
        Element.prototype.webkitMatchesSelector ||
        function(s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
              i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {}
          return i > -1;            
        };

function match(el, sel) {
  return MATCH.call(el, sel);
}


/**
 * Asify DOM event handler.
 * @param {HTMLElement} dom DOM Element.
 * @param {string|string[]} type Event type.
 * @param {string} selector Bubble event selector
 * @example
 * for await (const ret of event(div, 'click')) {
 *   console.log(ret);
 * }
 */
export async function* event(dom, type, selector = null) {
  const hook = promisifyCallback(typeof dom === 'string'? document.querySelector(dom): dom, type, (target, type, cb) => {
    const callback = selector? e => {
      if (match(e.target, selector)) {
        cb(e);
      }
    }: cb;
    dom.addEventListener(type, callback, false);
    return () => dom.removeEventListener(type, callback);
  });
  while (1) {yield await hook();}
}

