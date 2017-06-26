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
import EventEmitter from 'eventemitter2';
import {
  wait,
  infinity,
  intervals,
  emitter
} from '../util';
import {
  expect
} from 'chai';


describe('sagu', () => {
  describe('util', () => {
    describe('@wait()', () => {
      it('should wait specified ms.', async () => {
        const times = [];
        for await (const time of [100, 200, 300]) {
          await wait(time);
          times.push(time);
        }
        expect(times).to.be.deep.equal([100, 200, 300]);
      });
    });

    describe('@intervals()', () => {
      it('should loop with specified ms.', async () => {
        let value = 0;
        for await (const count of intervals(200)) {
          if (count > 3) {
            break;
          } else {
            value++;
          }
        }
        expect(value).to.be.equal(4);
      });
    });

    describe('@inifinity()', () => {
      it('should loop infinite', async () => {
        let value = 0;
        for await (const count of infinity()) {
          if (count > 10) {
            break;
          } else {
            value++;
          }
        }
        expect(value).to.be.equal(11);
      });
    });

    describe('@emitter', () => {
      it('sould wait until event emitted.', done => {
        const e = new EventEmitter();
        (async () => {
          const values = [];
          let count = 0;
          for await (const {dispose, type, event} of emitter(e, 'test')) {
            values.push(event);
            if (count++ > 2) {
              dispose();
              break;
            }
          }
          expect(values).to.be.deep.eq(['test', 'test', 'test', 'test']);
          done();
        })();

        e.emit('test', 'test');
        e.emit('test', 'test');
        e.emit('test', 'test');
        e.emit('test', 'test');
      });
    });
  });
});
