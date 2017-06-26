var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var runtime = createCommonjsModule(function (module) {
  /**
   * Copyright (c) 2014, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the BSD-style license found in the
   * https://raw.github.com/facebook/regenerator/master/LICENSE file. An
   * additional grant of patent rights can be found in the PATENTS file in
   * the same directory.
   */

  !function (global) {
    "use strict";

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    var inModule = 'object' === "object";
    var runtime = global.regeneratorRuntime;
    if (runtime) {
      if (inModule) {
        // If regeneratorRuntime is defined globally and we're in a module,
        // make the exports object identical to regeneratorRuntime.
        module.exports = runtime;
      }
      // Don't bother evaluating the rest of this file if the runtime was
      // already defined globally.
      return;
    }

    // Define the runtime globally (as expected by generated code) as either
    // module.exports (if we're in a module) or a new, empty object.
    runtime = global.regeneratorRuntime = inModule ? module.exports : {};

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    runtime.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    IteratorPrototype[iteratorSymbol] = function () {
      return this;
    };

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
    GeneratorFunctionPrototype.constructor = GeneratorFunction;
    GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function (method) {
        prototype[method] = function (arg) {
          return this._invoke(method, arg);
        };
      });
    }

    runtime.isGeneratorFunction = function (genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor ? ctor === GeneratorFunction ||
      // For the native GeneratorFunction constructor, the best we can
      // do is to check its .name property.
      (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
    };

    runtime.mark = function (genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        if (!(toStringTagSymbol in genFun)) {
          genFun[toStringTagSymbol] = "GeneratorFunction";
        }
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    runtime.awrap = function (arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value && (typeof value === "undefined" ? "undefined" : babelHelpers.typeof(value)) === "object" && hasOwn.call(value, "__await")) {
            return Promise.resolve(value.__await).then(function (value) {
              invoke("next", value, resolve, reject);
            }, function (err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return Promise.resolve(value).then(function (unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration. If the Promise is rejected, however, the
            // result for this iteration will be rejected with the same
            // reason. Note that rejections of yielded Promises are not
            // thrown back into the generator function, as is the case
            // when an awaited Promise is rejected. This difference in
            // behavior between yield and await is important, because it
            // allows the consumer to decide what to do with the yielded
            // rejection (swallow it and continue, manually .throw it back
            // into the generator, abandon iteration, whatever). With
            // await, by contrast, there is no opportunity to examine the
            // rejection reason outside the generator function, so the
            // only option is to throw it from the await expression, and
            // let the generator function handle the exception.
            result.value = unwrapped;
            resolve(result);
          }, reject);
        }
      }

      if (babelHelpers.typeof(global.process) === "object" && global.process.domain) {
        invoke = global.process.domain.bind(invoke);
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new Promise(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
        // If enqueue has been called before, then we want to wait until
        // all previous Promises have been resolved before calling invoke,
        // so that results are always delivered in the correct order. If
        // enqueue has not been called before, then it is important to
        // call invoke immediately, without waiting on a callback to fire,
        // so that the async generator function has the opportunity to do
        // any necessary setup in a predictable way. This predictability
        // is why the Promise constructor synchronously invokes its
        // executor callback, and why async functions synchronously
        // execute code before the first await. Since we implement simple
        // async functions in terms of async generators, it is especially
        // important to get this right, even though it requires care.
        previousPromise ? previousPromise.then(callInvokeWithMethodAndArg,
        // Avoid propagating failures to Promises returned by later
        // invocations of the iterator.
        callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    AsyncIterator.prototype[asyncIteratorSymbol] = function () {
      return this;
    };
    runtime.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    runtime.async = function (innerFn, outerFn, self, tryLocsList) {
      var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));

      return runtime.isGeneratorFunction(outerFn) ? iter // If outerFn is a generator, return the full iterator.
      : iter.next().then(function (result) {
        return result.done ? result.value : iter.next();
      });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;
          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);
          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done ? GenStateCompleted : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };
          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          if (delegate.iterator.return) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError("The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (!info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined;
        }
      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    Gp[toStringTagSymbol] = "Generator";

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    Gp[iteratorSymbol] = function () {
      return this;
    };

    Gp.toString = function () {
      return "[object Generator]";
    };

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    runtime.keys = function (object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1,
              next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    runtime.values = values;

    function doneResult() {
      return { value: undefined, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function reset(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
              this[name] = undefined;
            }
          }
        }
      },

      stop: function stop() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function dispatchException(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined;
          }

          return !!caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }
            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }
            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function abrupt(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function complete(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" || record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function finish(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function _catch(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function delegateYield(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined;
        }

        return ContinueSentinel;
      }
    };
  }(
  // Among the various tricks for obtaining a reference to the global
  // object, this seems to be the most reliable technique that does not
  // use indirect eval (which violates Content Security Policy).
  babelHelpers.typeof(commonjsGlobal) === "object" ? commonjsGlobal : (typeof window === "undefined" ? "undefined" : babelHelpers.typeof(window)) === "object" ? window : (typeof self === "undefined" ? "undefined" : babelHelpers.typeof(self)) === "object" ? self : commonjsGlobal);
});

// This method of obtaining a reference to the global object needs to be
// kept identical to the way it is obtained in runtime.js
var g = babelHelpers.typeof(commonjsGlobal) === "object" ? commonjsGlobal : (typeof window === 'undefined' ? 'undefined' : babelHelpers.typeof(window)) === "object" ? window : (typeof self === 'undefined' ? 'undefined' : babelHelpers.typeof(self)) === "object" ? self : commonjsGlobal;

// Use `getOwnPropertyNames` because not all browsers support calling
// `hasOwnProperty` on the global `self` object in a worker. See #183.
var hadRuntime = g.regeneratorRuntime && Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

// Save the old regeneratorRuntime in case it needs to be restored later.
var oldRuntime = hadRuntime && g.regeneratorRuntime;

// Force reevalutation of runtime.js.
g.regeneratorRuntime = undefined;

var runtimeModule = runtime;

if (hadRuntime) {
  // Restore the original runtime.
  g.regeneratorRuntime = oldRuntime;
} else {
  // Remove the global property added by runtime.js.
  try {
    delete g.regeneratorRuntime;
  } catch (e) {
    g.regeneratorRuntime = undefined;
  }
}

var index = runtimeModule;

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

  function getEventHandler(isResolver, type) {
    return function (e) {
      var diff = isResolver ? { event: e, error: null } : { event: null, error: e };
      var o = babelHelpers.extends({}, diff, { type: type, dispose: disposes[type] });
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
  var _ref = babelHelpers.asyncGenerator.wrap(index.mark(function _callee(dom, type) {
    var selector = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var hook;
    return index.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            hook = promisifyCallback(dom, type, function (target, type, cb) {
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
  var _ref = babelHelpers.asyncToGenerator(index.mark(function _callee(ms) {
    var retval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    return index.wrap(function _callee$(_context) {
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
  var _ref2 = babelHelpers.asyncGenerator.wrap(index.mark(function _callee2(time) {
    var skipStart = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var first, count;
    return index.wrap(function _callee2$(_context2) {
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
  var _ref3 = babelHelpers.asyncGenerator.wrap(index.mark(function _callee3() {
    var start = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
    var i;
    return index.wrap(function _callee3$(_context3) {
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
  var _ref4 = babelHelpers.asyncGenerator.wrap(index.mark(function _callee4(emitter, type) {
    var hook;
    return index.wrap(function _callee4$(_context4) {
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
  var _ref = babelHelpers.asyncGenerator.wrap(index.mark(function _callee(url, options) {
    var interval = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1000;

    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, _value, p;

    return index.wrap(function _callee$(_context) {
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
  var _ref2 = babelHelpers.asyncGenerator.wrap(index.mark(function _callee2(url, type) {
    var hook;
    return index.wrap(function _callee2$(_context2) {
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
  var _ref3 = babelHelpers.asyncGenerator.wrap(index.mark(function _callee3(url, events) {
    var socketIO = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;
    var hook;
    return index.wrap(function _callee3$(_context3) {
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
var retryable = function () {
  var _ref4 = babelHelpers.asyncToGenerator(index.mark(function _callee4(url, _ref5) {
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

    return index.wrap(function _callee4$(_context4) {
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

export { event, wait, intervals, infinity, emitter, poll, sse, ws, retryable };
