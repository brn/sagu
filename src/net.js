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
import {
  wait,
  infinity
} from './util';


/**
 * Polling http.
 * @param {string} url Url to fetch.
 * @param {Object} options Fetch options.
 * @param {number} interval polling interval.
 */
export async function* poll(url, options, interval = 1000) {
  for await (const p of infinity(interval, true)) {
    yield await fetch(url, options).then(response => {
      return response.ok? {ok: true, response}: {ok: false, error: response};
    }, e => {
      return {ok: false, error: e};
    });
  }
}


/**
 * Create ServerSentEvent async generator that yield each response.
 * @param {string|string[]} type Event type.
 * @param {string} url Server endpoint.
 *
 * @example
 * for await (const {event, type, dispose} of sse('status', 'https://www.ex.com/event')) {
 *   console.log(ret);
 * }
 */
export async function* sse(url, type) {
  const hook = promisifyCallback(new EventSource(url), type, (target, type, cb) => {
    target.addEventListener(type, cb, false);
    return () => target.removeEventListener(type, cb);
  });
  while (1) {yield await hook();}
}


/**
 * Create magic function that convert websocket event handler to async generator.
 * @param {string} url Url to connect.
 * @param {function(*, string, Function, Function): Function} setHandler Set event handler funcion.
 * @param {function(*, string, Function, Function): void} removeHandler Remove event function.
 * @param {WebSocket|SocketIO} io WebSocket or SocketIO
 * @param {string[]} eventTypes Listening event list.
 * @param {string[]} errorTypes Listening error event list.
 * @returns {Function} WebSocket callback async generator.
 */
function websocketGenerator(
  url,
  setHandler,
  removeHandler,
  io = url => new WebSocket(url),
  eventTypes = ['onopen', 'onmessage'],
  errorTypes = ['onerror']) {
  var connection = io(url);
  return promisifyCallback(connection, eventTypes.concat(errorTypes), (c, type, cb, error) => {
    if (errorTypes.indexOf(type) > -1) {
      setHandler(c, type, error);
    } else {
      setHandler(c, type, cb);
    }
    return () => removeHandler(c, type, cb, error);
  });
}


/**
 * Native WebSocket async generator function.
 * @param {string} url Url to connect.
 * @returns {Function} WebSocket callback async generator.
 */
function websocket(url) {
  return websocketGenerator(
    url,
    (c, type, cb) => c[type] = cb,
    (c, type, cb) => c[type] = null
  );
}


/**
 * Socket.IO async generator function.
 * @param {string} url Url to connect.
 * @param {string|string[]} events SocketIO additional events.
 * @param {SocketIO} io SocketIO constructor.
 * @returns {Function} SocketIO callback async generator.
 */
function socketio(url, events, io) {
  return websocketGenerator(
    url,
    (c, type, cb) => c.on(type, cb),
    (c, type, cb) => c.off(type, cb),
    io,
    (Array.isArray(events)? events: [events]).concat([
      'connect',
      'event',
      'disconnect',
      'ping',
      'pong',
      'reconnect',
      'reconnect_attempt',
      'reconnecting'
    ]),
    [
      'error',
      'connect_error',
      'connect_timeout',
      'reconnect_error',
      'reconnect_failed'
    ]);
}


/**
 * Async Generator WebSocket generator.
 * @param {string} url Url to connect.
 * @param {string|string[]} events SocketIO additional events.
 * @param {SocketIO} socketIO Socket.IO constructor function.
 * @throws {Error} 
 */
export async function* ws(url, events, socketIO = null) {
  let hook;
  if (!socketIO) {
    if (events) {
      throw new Error(`Native WebSocket can't specify events parameter.`);
    }
    hook = websocket(url);
  } else {
    hook = socketio(url, events, socketIO);
  }
  while (1) {yield await hook();}
}


/**
 * Make fetch function to Retriable.
 * @param {Function(): Promise<Response>} promise Fetch result.
 * @param {number} max Max retriable count.
 * @param {function(number): number} timingFn Retry timing generator.
 * @returns {Response}
 *
 * @example
 * const response = await retryable(`http://localhost:9877/failed?_=${Date.now()}`, {
 *   options: {mode: 'cors'}, // optional
 *   limit: 10, // optional default 5
 *   timing() {return 100}, // optional  default 1000
 *   isError(response) {return !response.ok} // optional default !response.ok
 * })
 */
export async function retryable(url, {options = {}, timing = () => 1000, limit = 5, isFailed = res => !res.ok}) {
  for await (const time of infinity(1)) {
    const response = await fetch(url, options).catch(r => r);
    if (response && !isFailed(response)) {
      return {success: true, response};
    } else if (time > limit) {
      return {success: false, response};
    }
    await wait(timing(time));
  }
}
