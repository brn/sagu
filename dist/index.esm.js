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
function promisifyCallback(target, type, set) {
  var types = Array.isArray(type) ? type : [type];
  var buffer = [];

  var _resolver = null;
  var disposes = {};

  function dispose() {
    for (var key in disposes) {
      disposes[key]();
    }
  }

  function getEventHandler(isResolver, type) {
    return function (e) {
      var diff = isResolver ? { event: e, error: null } : { event: null, error: e };
      var o = babelHelpers.extends({}, diff, { type: type, dispose: dispose });
      if (isResolver && _resolver) {
        _resolver(o);
      } else {
        buffer.push(o);
      }
    };
  }

  types.forEach(function (type, i) {
    if (!type) {
      return;
    }
    type = type.trim();
    disposes[type] = set(target, type, getEventHandler(true, type), getEventHandler(false, type));
  });

  return function () {
    return new Promise(function (resolve) {
      if (buffer.length) {
        resolve(buffer.shift());
      } else {
        _resolver = function resolver(v) {
          _resolver = null;
          resolve(v);
        };
      }
    });
  };
}

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

// https://developer.mozilla.org/ja/docs/Web/API/Element/matches
var MATCH = Element.prototype.matches || Element.prototype.matchesSelector || Element.prototype.mozMatchesSelector || Element.prototype.msMatchesSelector || Element.prototype.oMatchesSelector || Element.prototype.webkitMatchesSelector || function (s) {
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
var event = function () {
  var _ref = babelHelpers.asyncGenerator.wrap(regeneratorRuntime.mark(function _callee(dom, type) {
    var selector = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var hook;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            hook = promisifyCallback(typeof dom === 'string' ? document.querySelector(dom) : dom, type, function (target, type, cb) {
              var callback = selector ? function (e) {
                if (match(e.target, selector)) {
                  cb(e);
                }
              } : cb;
              dom.addEventListener(type, callback, false);
              return function () {
                return dom.removeEventListener(type, callback);
              };
            });

          case 1:
            

            _context.next = 4;
            return babelHelpers.asyncGenerator.await(hook());

          case 4:
            _context.next = 6;
            return _context.sent;

          case 6:
            _context.next = 1;
            break;

          case 8:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function event(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

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
 * Wait specified ms.
 * @param {number} ms Wating time milliseconds.
 * @returns {Promise<*>} 
 */
var wait = function () {
  var _ref = babelHelpers.asyncToGenerator(regeneratorRuntime.mark(function _callee(ms) {
    var retval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return new Promise(function (p) {
              return setTimeout(function () {
                return p(retval);
              }, ms);
            });

          case 2:
            return _context.abrupt('return', _context.sent);

          case 3:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function wait(_x) {
    return _ref.apply(this, arguments);
  };
}();

/**
 * Loop intervals with specified ms.
 * @param {number} time Wating time milliseconds.
 * @param {boolean} skipStart Skip wating first time iteration.
 */
var intervals = function () {
  var _ref2 = babelHelpers.asyncGenerator.wrap(regeneratorRuntime.mark(function _callee2(time) {
    var skipStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var first, count;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            first = true;
            count = 0;

          case 2:
            

            if (!(first && skipStart)) {
              _context2.next = 9;
              break;
            }

            _context2.next = 6;
            return count++;

          case 6:
            first = false;
            _context2.next = 13;
            break;

          case 9:
            _context2.next = 11;
            return babelHelpers.asyncGenerator.await(wait(time, count++));

          case 11:
            _context2.next = 13;
            return _context2.sent;

          case 13:
            _context2.next = 2;
            break;

          case 15:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function intervals(_x3) {
    return _ref2.apply(this, arguments);
  };
}();

/**
 * Infinite value generator.
 * @param {number} start Start value.
 */
var infinity = function () {
  var _ref3 = babelHelpers.asyncGenerator.wrap(regeneratorRuntime.mark(function _callee3() {
    var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var i;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            i = start;

          case 1:
            

            _context3.next = 4;
            return i++;

          case 4:
            _context3.next = 1;
            break;

          case 6:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function infinity() {
    return _ref3.apply(this, arguments);
  };
}();

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
var emitter = function () {
  var _ref4 = babelHelpers.asyncGenerator.wrap(regeneratorRuntime.mark(function _callee4(emitter, type) {
    var hook;
    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            hook = promisifyCallback(emitter, type, function (target, type, cb) {
              emitter.on(type, cb);
              return function () {
                return emitter.off(type, cb);
              };
            });

          case 1:
            

            _context4.next = 4;
            return hook();

          case 4:
            _context4.next = 1;
            break;

          case 6:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function emitter(_x6, _x7) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Read stream with loop.
 * @param {Response} response Response object.
 */
var readStream = function () {
  var _ref6 = babelHelpers.asyncGenerator.wrap(regeneratorRuntime.mark(function _callee5(response) {
    var reader, chunk;
    return regeneratorRuntime.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            reader = response.body.getReader();

          case 1:
            

            _context5.next = 4;
            return babelHelpers.asyncGenerator.await(reader.read());

          case 4:
            chunk = _context5.sent;
            _context5.next = 7;
            return { chunk: chunk, reader: reader };

          case 7:
            _context5.next = 1;
            break;

          case 9:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function readStream(_x14) {
    return _ref6.apply(this, arguments);
  };
}();

/**
 * Chunk Reader.
 */


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
 * Polling http.
 * @param {string} url Url to fetch.
 * @param {Object} options Fetch options.
 * @param {number} interval polling interval.
 */
var poll = function () {
  var _ref = babelHelpers.asyncGenerator.wrap(regeneratorRuntime.mark(function _callee(url, options) {
    var interval = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;

    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, p;

    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _iteratorNormalCompletion = true;
            _didIteratorError = false;
            _iteratorError = undefined;
            _context.prev = 3;
            _iterator = babelHelpers.asyncIterator(infinity(interval, true));

          case 5:
            _context.next = 7;
            return babelHelpers.asyncGenerator.await(_iterator.next());

          case 7:
            _step = _context.sent;
            _iteratorNormalCompletion = _step.done;
            _context.next = 11;
            return babelHelpers.asyncGenerator.await(_step.value);

          case 11:
            _value = _context.sent;

            if (_iteratorNormalCompletion) {
              _context.next = 21;
              break;
            }

            p = _value;
            _context.next = 16;
            return babelHelpers.asyncGenerator.await(fetch(url, options).then(function (response) {
              return response.ok ? { ok: true, response: response } : { ok: false, error: response };
            }, function (e) {
              return { ok: false, error: e };
            }));

          case 16:
            _context.next = 18;
            return _context.sent;

          case 18:
            _iteratorNormalCompletion = true;
            _context.next = 5;
            break;

          case 21:
            _context.next = 27;
            break;

          case 23:
            _context.prev = 23;
            _context.t0 = _context['catch'](3);
            _didIteratorError = true;
            _iteratorError = _context.t0;

          case 27:
            _context.prev = 27;
            _context.prev = 28;

            if (!(!_iteratorNormalCompletion && _iterator.return)) {
              _context.next = 32;
              break;
            }

            _context.next = 32;
            return babelHelpers.asyncGenerator.await(_iterator.return());

          case 32:
            _context.prev = 32;

            if (!_didIteratorError) {
              _context.next = 35;
              break;
            }

            throw _iteratorError;

          case 35:
            return _context.finish(32);

          case 36:
            return _context.finish(27);

          case 37:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[3, 23, 27, 37], [28,, 32, 36]]);
  }));

  return function poll(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

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
var sse = function () {
  var _ref2 = babelHelpers.asyncGenerator.wrap(regeneratorRuntime.mark(function _callee2(url, type) {
    var hook;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            hook = promisifyCallback(new EventSource(url), type, function (target, type, cb) {
              target.addEventListener(type, cb, false);
              return function () {
                return target.removeEventListener(type, cb);
              };
            });

          case 1:
            

            _context2.next = 4;
            return babelHelpers.asyncGenerator.await(hook());

          case 4:
            _context2.next = 6;
            return _context2.sent;

          case 6:
            _context2.next = 1;
            break;

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function sse(_x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

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
function websocketGenerator(url, setHandler, removeHandler) {
  var io = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : function (url) {
    return new WebSocket(url);
  };
  var eventTypes = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : ['onopen', 'onmessage'];
  var errorTypes = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : ['onerror'];

  var connection = io(url);
  return promisifyCallback(connection, eventTypes.concat(errorTypes), function (c, type, cb, error) {
    if (errorTypes.indexOf(type) > -1) {
      setHandler(c, type, error);
    } else {
      setHandler(c, type, cb);
    }
    return function () {
      return removeHandler(c, type, cb, error);
    };
  });
}

/**
 * Native WebSocket async generator function.
 * @param {string} url Url to connect.
 * @returns {Function} WebSocket callback async generator.
 */
function websocket(url) {
  return websocketGenerator(url, function (c, type, cb) {
    return c[type] = cb;
  }, function (c, type, cb) {
    return c[type] = null;
  });
}

/**
 * Socket.IO async generator function.
 * @param {string} url Url to connect.
 * @param {string|string[]} events SocketIO additional events.
 * @param {SocketIO} io SocketIO constructor.
 * @returns {Function} SocketIO callback async generator.
 */
function socketio(url, events, io) {
  return websocketGenerator(url, function (c, type, cb) {
    return c.on(type, cb);
  }, function (c, type, cb) {
    return c.off(type, cb);
  }, io, (Array.isArray(events) ? events : [events]).concat(['connect', 'event', 'disconnect', 'ping', 'pong', 'reconnect', 'reconnect_attempt', 'reconnecting']), ['error', 'connect_error', 'connect_timeout', 'reconnect_error', 'reconnect_failed']);
}

/**
 * Async Generator WebSocket generator.
 * @param {string} url Url to connect.
 * @param {string|string[]} events SocketIO additional events.
 * @param {SocketIO} socketIO Socket.IO constructor function.
 * @throws {Error} 
 */
var ws = function () {
  var _ref3 = babelHelpers.asyncGenerator.wrap(regeneratorRuntime.mark(function _callee3(url, events) {
    var socketIO = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var hook;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            hook = void 0;

            if (socketIO) {
              _context3.next = 7;
              break;
            }

            if (!events) {
              _context3.next = 4;
              break;
            }

            throw new Error('Native WebSocket can\'t specify events parameter.');

          case 4:
            hook = websocket(url);
            _context3.next = 8;
            break;

          case 7:
            hook = socketio(url, events, socketIO);

          case 8:
            

            _context3.next = 11;
            return babelHelpers.asyncGenerator.await(hook());

          case 11:
            _context3.next = 13;
            return _context3.sent;

          case 13:
            _context3.next = 8;
            break;

          case 15:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function ws(_x9, _x10) {
    return _ref3.apply(this, arguments);
  };
}();

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
var retryable = function () {
  var _ref4 = babelHelpers.asyncToGenerator(regeneratorRuntime.mark(function _callee4(url, _ref5) {
    var _ref5$options = _ref5.options,
        options = _ref5$options === undefined ? {} : _ref5$options,
        _ref5$timing = _ref5.timing,
        timing = _ref5$timing === undefined ? function () {
      return 1000;
    } : _ref5$timing,
        _ref5$limit = _ref5.limit,
        limit = _ref5$limit === undefined ? 5 : _ref5$limit,
        _ref5$isFailed = _ref5.isFailed,
        isFailed = _ref5$isFailed === undefined ? function (res) {
      return !res.ok;
    } : _ref5$isFailed;

    var _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, _value2, time, response;

    return regeneratorRuntime.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _iteratorNormalCompletion2 = true;
            _didIteratorError2 = false;
            _iteratorError2 = undefined;
            _context4.prev = 3;
            _iterator2 = babelHelpers.asyncIterator(infinity(1));

          case 5:
            _context4.next = 7;
            return _iterator2.next();

          case 7:
            _step2 = _context4.sent;
            _iteratorNormalCompletion2 = _step2.done;
            _context4.next = 11;
            return _step2.value;

          case 11:
            _value2 = _context4.sent;

            if (_iteratorNormalCompletion2) {
              _context4.next = 28;
              break;
            }

            time = _value2;
            _context4.next = 16;
            return fetch(url, options).catch(function (r) {
              return r;
            });

          case 16:
            response = _context4.sent;

            if (!(response && !isFailed(response))) {
              _context4.next = 21;
              break;
            }

            return _context4.abrupt('return', { ok: true, response: response });

          case 21:
            if (!(time > limit)) {
              _context4.next = 23;
              break;
            }

            return _context4.abrupt('return', { ok: false, response: response });

          case 23:
            _context4.next = 25;
            return wait(timing(time));

          case 25:
            _iteratorNormalCompletion2 = true;
            _context4.next = 5;
            break;

          case 28:
            _context4.next = 34;
            break;

          case 30:
            _context4.prev = 30;
            _context4.t0 = _context4['catch'](3);
            _didIteratorError2 = true;
            _iteratorError2 = _context4.t0;

          case 34:
            _context4.prev = 34;
            _context4.prev = 35;

            if (!(!_iteratorNormalCompletion2 && _iterator2.return)) {
              _context4.next = 39;
              break;
            }

            _context4.next = 39;
            return _iterator2.return();

          case 39:
            _context4.prev = 39;

            if (!_didIteratorError2) {
              _context4.next = 42;
              break;
            }

            throw _iteratorError2;

          case 42:
            return _context4.finish(39);

          case 43:
            return _context4.finish(34);

          case 44:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this, [[3, 30, 34, 44], [35,, 39, 43]]);
  }));

  return function retryable(_x12, _x13) {
    return _ref4.apply(this, arguments);
  };
}();

/**
 * Stream Buffer.
 */
var Buffer = function () {
  /**
   * @param {boolean} isBinary Whether stream data is binary or not.
   */
  function Buffer(isBinary) {
    babelHelpers.classCallCheck(this, Buffer);

    this._buffer = [];
    this._isBinary = isBinary;
    this._locked = false;
  }

  /**
   * Append value to buffer.
   * @param {string|Uint8Array} value Stream chunk.
   */


  babelHelpers.createClass(Buffer, [{
    key: 'enqueu',
    value: function enqueu(value) {
      this._buffer.push(value);
    }

    /**
     * Return concatenated buffered value.
     * @returns {string|ArrayBuffe} Buffered values.
     */

  }, {
    key: 'readAll',
    value: function readAll() {
      var buffer = Buffer.concat(this._buffer);
      return !this._isBinary ? this.toString() : buffer;
    }

    /**
     * convert uint8Array to utf8 string.
     * @returns {string} Converted string.
     */

  }, {
    key: 'toString',
    value: function toString() {
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

  }], [{
    key: 'concat',
    value: function concat(buffers) {
      var length = buffers.reduce(function (len, buf) {
        return len + buf.length;
      }, 0);
      var offset = 0;
      return buffers.reduce(function (buf, val) {
        buf.set(val, offset);
        offset += val.length;
        return buf;
      }, new Uint8Array(length));
    }
  }, {
    key: 'convertUint8ArrayToUtfString',


    /**
     * Reference https://stackoverflow.com/a/22373135  
     * convert uint8Array to utf8 string.
     * @param {Uint8Array} buffer
     * @returns {string} Converted string.
     */
    value: function convertUint8ArrayToUtfString(buffer) {
      var outputBuffer = [];

      for (var i = 0, len = buffer.length; i < len;) {
        var c = buffer[i++];
        var codePoint = c >> 4;
        if (codePoint >= 0 && codePoint <= 7) {
          // 1byte code -- 0xxxxxxx
          outputBuffer.push(String.fromCharCode(c));
        } else if (codePoint >= 12 && codePoint <= 13) {
          // 2byte code -- 110xxxxx   10xxxxxx
          var c2 = buffer[i++];
          outputBuffer.push(String.fromCharCode((c & 0x1F) << 6 | c2 & 0x3F));
        } else if (codePoint === 14) {
          // 3byte code -- 1110xxxx  10xxxxxx  10xxxxxx
          var _c = buffer[i++];
          var c3 = buffer[i++];
          outputBuffer.push(String.fromCharCode((c & 0x0F) << 12 | (_c & 0x3F) << 6 | (c3 & 0x3F) << 0));
        }
      }

      return outputBuffer.join('');
    }
  }]);
  return Buffer;
}();
var ChunkReader = function () {
  /**
   * @param {{
   *   chunk: Uint8Array,
   *   buffer?: Buffer,
   *   reader: ReadableStream
   * }} opt
   */
  function ChunkReader(_ref7) {
    var chunk = _ref7.chunk,
        buffer = _ref7.buffer,
        reader = _ref7.reader;
    babelHelpers.classCallCheck(this, ChunkReader);

    this._chunk = chunk;
    this._buffer = buffer;
    this._reader = reader;
  }

  /**
   * Read chunk.
   * @returns {Uint8Array} Chunk value.
   */


  babelHelpers.createClass(ChunkReader, [{
    key: 'read',
    value: function read() {
      return this._chunk;
    }

    /**
     * Return whether buffered or not.
     * @returns {boolean} Buffering
     */

  }, {
    key: 'isBuffered',
    value: function isBuffered() {
      return !!this._buffer;
    }

    /**
     * Return buffered value.
     * @returns {Uint8Array|string} Buffered value.
     */

  }, {
    key: 'drainBuffer',
    value: function drainBuffer() {
      return this._buffer ? this._buffer.readAll() : null;
    }

    /**
     * Cancel stream.
     */

  }, {
    key: 'cancel',
    value: function cancel() {
      this._reader.cancel();
    }
  }]);
  return ChunkReader;
}();

var IS_STREAM_SUPPORTED = !!window.ReadableStream && !!window.WritableStream;
var EMPTY_ARRAY = window.Uint8Array ? new Uint8Array(new ArrayBuffer(0)) : null;
var FAILED_CHUNK = new ChunkReader({ chunk: null, buffer: null, reader: null, ok: false, done: true });

/**
 * Reading streaming data.
 * @param {string} url Fetch url.
 * @param {Retryable.Options} retryOption Retryable options.
 * @param {boolean} binary Is data is binary or not.
 * @param {boolean} buffering Whther buffering stream response or not.
 */
var stream = function () {
  var _ref8 = babelHelpers.asyncGenerator.wrap(regeneratorRuntime.mark(function _callee6(url, _ref9) {
    var _ref9$binary = _ref9.binary,
        binary = _ref9$binary === undefined ? false : _ref9$binary,
        _ref9$buffering = _ref9.buffering,
        buffering = _ref9$buffering === undefined ? true : _ref9$buffering,
        retryOptions = babelHelpers.objectWithoutProperties(_ref9, ['binary', 'buffering']);

    var _ref10, ok, response, buffer, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _value3, _value4, _value4$chunk, value, done, reader, sentinel;

    return regeneratorRuntime.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            if (IS_STREAM_SUPPORTED) {
              _context6.next = 2;
              break;
            }

            throw new Error('Stream not supported in this environment!');

          case 2:
            _context6.next = 4;
            return babelHelpers.asyncGenerator.await(retryable(url, retryOptions));

          case 4:
            _ref10 = _context6.sent;
            ok = _ref10.ok;
            response = _ref10.response;

            if (ok) {
              _context6.next = 9;
              break;
            }

            return _context6.abrupt('return', FAILED_CHUNK);

          case 9:
            buffer = buffering ? new Buffer(binary) : null;
            _iteratorNormalCompletion3 = true;
            _didIteratorError3 = false;
            _iteratorError3 = undefined;
            _context6.prev = 13;
            _iterator3 = babelHelpers.asyncIterator(readStream(response));

          case 15:
            _context6.next = 17;
            return babelHelpers.asyncGenerator.await(_iterator3.next());

          case 17:
            _step3 = _context6.sent;
            _iteratorNormalCompletion3 = _step3.done;
            _context6.next = 21;
            return babelHelpers.asyncGenerator.await(_step3.value);

          case 21:
            _value3 = _context6.sent;

            if (_iteratorNormalCompletion3) {
              _context6.next = 37;
              break;
            }

            _value4 = _value3, _value4$chunk = _value4.chunk, value = _value4$chunk.value, done = _value4$chunk.done, reader = _value4.reader;

            if (!done) {
              _context6.next = 31;
              break;
            }

            sentinel = Object.freeze({ chunk: new ChunkReader({ chunk: EMPTY_ARRAY, buffer: buffer, reader: reader }), ok: ok, done: done });

          case 26:
            

            _context6.next = 29;
            return sentinel;

          case 29:
            _context6.next = 26;
            break;

          case 31:

            if (buffering) {
              buffer.enqueu(value);
            }

            _context6.next = 34;
            return Object.freeze({ chunk: new ChunkReader({ chunk: value, buffer: buffer, reader: reader }), ok: ok, done: done });

          case 34:
            _iteratorNormalCompletion3 = true;
            _context6.next = 15;
            break;

          case 37:
            _context6.next = 43;
            break;

          case 39:
            _context6.prev = 39;
            _context6.t0 = _context6['catch'](13);
            _didIteratorError3 = true;
            _iteratorError3 = _context6.t0;

          case 43:
            _context6.prev = 43;
            _context6.prev = 44;

            if (!(!_iteratorNormalCompletion3 && _iterator3.return)) {
              _context6.next = 48;
              break;
            }

            _context6.next = 48;
            return babelHelpers.asyncGenerator.await(_iterator3.return());

          case 48:
            _context6.prev = 48;

            if (!_didIteratorError3) {
              _context6.next = 51;
              break;
            }

            throw _iteratorError3;

          case 51:
            return _context6.finish(48);

          case 52:
            return _context6.finish(43);

          case 53:
          case 'end':
            return _context6.stop();
        }
      }
    }, _callee6, this, [[13, 39, 43, 53], [44,, 48, 52]]);
  }));

  return function stream(_x15, _x16) {
    return _ref8.apply(this, arguments);
  };
}();

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

export { event, wait, intervals, infinity, emitter, poll, sse, ws, retryable, Buffer, stream };
