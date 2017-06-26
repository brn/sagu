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

import "core-js";
import 'whatwg-fetch';
import {
  intervals
} from '../util';
import {
  event
} from '../dom';
import {
  expect
} from 'chai';


describe('sagu', () => {
  describe('dom', () => {
    describe('@event()', () => {
      it('should wait dom event.', done => {
        const values = [];
        let count = 0;
        const div = document.body.appendChild(document.createElement('div'));

        (async () => {
          for await (const {event, dispose} of event(div, 'click')) {
            values.push(event.target.nodeName);
            if (count++ > 2) {
              dispose();
              break;
            }
          }

          expect(values).to.be.deep.eq(['DIV', 'DIV', 'DIV', 'DIV']);
          div.parentNode.removeChild(div);
          done();
        })();

        div.click();
        div.click();
        div.click();
        div.click();
      });


      it('should wait bubble dom event.', done => {
        const values = [];
        let count = 0;
        const div = document.body.appendChild(document.createElement('div'));
        const a = div.appendChild(document.createElement('span').appendChild(document.createElement('a')));
        a.className = 'test-class-name';

        (async () => {
          for await (const {event, dispose} of event(div, 'click', '.test-class-name')) {
            values.push(event.target.nodeName);
            if (count++ > 2) {
              dispose();
              break;
            }
          }

          expect(values).to.be.deep.eq(['A', 'A', 'A', 'A']);
          div.parentNode.removeChild(div);
          done();
        })();

        a.click();
        a.click();
        a.click();
        a.click();
      });
    });
  });
});
