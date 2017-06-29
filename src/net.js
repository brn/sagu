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
 * @returns {{ok: boolean, response: Response}}
 *
 * @example
 * const {ok, response} = await retryable(`http://localhost:9877/failed?_=${Date.now()}`, {
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
      return {ok: true, response};
    } else if (time > limit) {
      return {ok: false, response};
    }
    await wait(timing(time));
  }
}



/**
 * Stream Buffer.
 */
export class Buffer {
  /**
   * @param {boolean} isBinary Whether stream data is binary or not.
   */
  constructor(isBinary) {
    this._buffer = [];
    this._isBinary = isBinary;
    this._locked = false;
  }

  /**
   * Append value to buffer.
   * @param {string|Uint8Array} value Stream chunk.
   */
  enqueu(value) {
    this._buffer.push(value);
  }

  /**
   * Return concatenated buffered value.
   * @returns {string|ArrayBuffe} Buffered values.
   */
  readAll() {
    const buffer = Buffer.concat(this._buffer);
    return !this._isBinary? this.toString(): buffer;
  }

  /**
   * convert uint8Array to utf8 string.
   * @returns {string} Converted string.
   */
  toString() {
    if (!this._isBinary) {
      return Buffer.convertUint8ArrayToUtfString(Buffer.concat(this._buffer));
    }
    return Buffer.conat(this._buffer).toString();
  }

  /**
   * Creates a new Uint8Array based on different ArrayBuffers
   * @param {ArrayBuffer[]} buffers Array of ArrayBuffer.
   * @return {ArrayBuffer} The new ArrayBuffer created out of the buffers.
   */
  static concat(buffers) {
    const length = buffers.reduce((len, buf) => len + buf.length, 0);
    let offset = 0;
    return buffers.reduce((buf, val) => {
      buf.set(val, offset);
      offset += val.length;
      return buf;
    }, new Uint8Array(length));
  };

  /**
   * Reference https://stackoverflow.com/a/22373135  
   * convert uint8Array to utf8 string.
   * @param {Uint8Array} buffer
   * @returns {string} Converted string.
   */
  static convertUint8ArrayToUtfString(buffer) {
    const outputBuffer = [];

    for (let i = 0, len = buffer.length; i < len;) {
      const c = buffer[i++];
      const codePoint = c >> 4;
      if (codePoint >= 0 && codePoint <= 7) {
        // 1byte code -- 0xxxxxxx
        outputBuffer.push(String.fromCharCode(c));
      } else if (codePoint >= 12 && codePoint <= 13) {
        // 2byte code -- 110xxxxx   10xxxxxx
        const c2 = buffer[i++];
        outputBuffer.push(String.fromCharCode(((c & 0x1F) << 6) | (c2 & 0x3F)));
      } else if (codePoint === 14) {
        // 3byte code -- 1110xxxx  10xxxxxx  10xxxxxx
        const c2 = buffer[i++];
        const c3 = buffer[i++];
        outputBuffer.push(String.fromCharCode(((c & 0x0F) << 12) |
                                              ((c2 & 0x3F) << 6) |
                                              ((c3 & 0x3F) << 0)));
      }
    }

    return outputBuffer.join(''); 
  }
}


/**
 * Read stream with loop.
 * @param {Response} response Response object.
 */
async function* readStream(response) {
  const reader = response.body.getReader();
  while (1) {
    const chunk = await reader.read();
    yield {chunk, reader};
  }
}


/**
 * Chunk Reader.
 */
class ChunkReader {
  /**
   * @param {{
   *   chunk: Uint8Array,
   *   buffer?: Buffer,
   *   reader: ReadableStream
   * }} opt
   */
  constructor({chunk, buffer, reader}) {
    this._chunk = chunk;
    this._buffer = buffer;
    this._reader = reader;
  }


  /**
   * Read chunk.
   * @returns {Uint8Array} Chunk value.
   */
  read() {
    return this._chunk;
  }


  /**
   * Return whether buffered or not.
   * @returns {boolean} Buffering
   */
  isBuffered() {
    return !!this._buffer;
  }


  /**
   * Return buffered value.
   * @returns {Uint8Array|string} Buffered value.
   */
  drainBuffer() {
    return this._buffer? this._buffer.readAll(): null;
  }

  /**
   * Cancel stream.
   */
  cancel() {this._reader.cancel()}
}
const IS_STREAM_SUPPORTED = !!window.ReadableStream && !!window.WritableStream;
const EMPTY_ARRAY = window.Uint8Array? new Uint8Array(new ArrayBuffer(0)): null;
const FAILED_CHUNK = new ChunkReader({chunk: null, buffer: null, reader: null, ok: false, done: true});


/**
 * Reading streaming data.
 * @param {string} url Fetch url.
 * @param {Retryable.Options} retryOption Retryable options.
 * @param {boolean} binary Is data is binary or not.
 * @param {boolean} buffering Whther buffering stream response or not.
 */
export async function* stream(url, {binary = false, buffering = true, ...retryOptions}) {
  if (!IS_STREAM_SUPPORTED) {
    throw new Error('Stream not supported in this environment!');
  }
  const {ok, response} = await retryable(url, retryOptions);
  if (!ok) {
    return FAILED_CHUNK;
  }

  const buffer = buffering? new Buffer(binary): null;

  for await (const {chunk: {value, done}, reader} of readStream(response)) {
    if (done) {
      const sentinel = Object.freeze({chunk: new ChunkReader({chunk: EMPTY_ARRAY, buffer, reader}), ok, done});
      while (1) {
        yield sentinel;
      }
    }

    if (buffering) {
      buffer.enqueu(value);
    }

    yield Object.freeze({chunk: new ChunkReader({chunk: value, buffer, reader}), ok, done});
  }
}
