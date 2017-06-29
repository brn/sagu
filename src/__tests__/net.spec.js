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

import io from 'socket.io-client';
import {
  poll,
  ws,
  sse,
  retryable,
  stream,
  Buffer
} from '../net';
import {
  expect
} from 'chai';
import EXAMPLES_JSON from '../../examples.json';

describe('sagu', () => {
  describe('net', () => {
    describe('@poll()', () => {
      it('should polling http request.', async () => {
        const values = [];
        let count = 0;
        const expectation = {ok: true, ok: true, status: 200};
        for await (const {ok, response} of poll('/', {method: 'GET'}, 100)) {
          values.push({ok, status: response.status, ok: response.ok});
          if (count++ > 5) {
            break;
          }
        }
        expect(values).to.be.deep.eq([
          expectation,
          expectation,
          expectation,
          expectation,
          expectation,
          expectation,
          expectation
        ]);
      });
    });

    describe('@sse()', () => {
      it('should wait sever sent event.', async () => {
        const values = [];
        let count = 0;
        for await (const {event, dispose} of sse('http://localhost:9877/sse', 'test')) {
          values.push(JSON.parse(event.data).key);
          if (count++ > 2) {
            dispose();
            break;
          }
        }
        expect(values).to.be.deep.eq(['test', 'test', 'test', 'test']);
      });
    });


    describe('@ws()', () => {
      it('should wait websocket response with socket.io.', async () => {
        const values = [];
        let count = 0;

        for await (const {event, type, dispose} of ws('ws://localhost:9877', 'request', io)) {
          switch (type) {
          case 'request':
            values.push(event.key);
            break;
          default:
          }

          if (count++ > 3) {
            dispose();
            break;
          }
        }
        expect(values).to.be.deep.eq(['test', 'test', 'test', 'test']);
      });
    });

    describe('@retryable()', () => {
      it('should retry fetch request if failed.', async () => {
        const {ok, response} = await retryable(`http://localhost:9877/failed?_=${Date.now()}`, {
          options: {mode: 'cors'},
          limit: 10,
          timing() {return 100}
        });
        expect(ok).to.be.eq(true);
        const json = await response.json();
        expect(json).to.be.deep.eq({key: 'success'});
      });
    });

    describe('@stream()', () => {
      it('should buffering binary streaming data.', async () => {
        const expectationsData = '0'.repeat(10000).split('0').map((v, i) => i);
        const expectations = new Uint8Array(new ArrayBuffer(expectationsData.length));
        expectations.set(expectationsData);
        for await (const {chunk, ok, done} of stream('http://localhost:9877/binary-stream', {binary: true})) {
          if (done) {
            const ret = chunk.drainBuffer();
            expect(ret.length).to.be.eq(10001);
            expect(ret).to.be.deep.eq(expectations);
            break;
          }
        }
      });

      it('should not buffering binary streaming data.', async () => {
        const buffer = [];
        const expectationsData = '0'.repeat(10000).split('0').map((v, i) => i);
        const expectations = new Uint8Array(new ArrayBuffer(expectationsData.length));
        expectations.set(expectationsData);
        for await (const {chunk, ok, done} of stream('http://localhost:9877/binary-stream', {binary: true, buffering: false})) {
          buffer.push(chunk.read());
          if (done) {
            let ret = chunk.drainBuffer();
            expect(ret).to.be.eq(null);
            ret = Buffer.concat(buffer);
            expect(ret.length).to.be.eq(10001);
            expect(ret).to.be.deep.eq(expectations);
            break;
          }
        }
      });

      it('should buffering json streaming data.', async () => {
        const len = JSON.stringify(EXAMPLES_JSON).length;
        for await (const {chunk, ok, done} of stream('http://localhost:9877/json-stream', {binary: false})) {
          if (done) {
            const ret = chunk.drainBuffer();
            const json = JSON.parse(ret);
            expect(JSON.stringify(json).length).to.be.eq(len);
            expect(json).to.be.deep.eq(EXAMPLES_JSON);
            break;
          }
        }
      });
    });
  });
});
