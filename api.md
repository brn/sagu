# API

## wait

```typescript
wait<T>(ms: number, retval?: T): Promise<Generator<T>>
```

* `ms: number` Milliseconds to wait.
* `retval: T` Return value of wait. `default: null`.
* `Return` retval or null.

Wait specified milliseconds.

**examples**

```javascript
for await (const x of [100, 200, 300]) {
  await wait(x);
}
```

## intervals

```typescript
intervals(time: number, skipStart: boolean = false): Promise<Generator<number>>
```

* `time: number` Milliseconds to interval.
* `skipStart: boolean = false` Skip waiting at first time.
* `Return` Current count.

Loop specified milliseconds intervals.

**examples**

```javascript
for await (const count of intervals(100)) {
  console.log(count);
  // to stop
  break;
}
```

## infinity

```typescript
infinity(start: number = 0): Promise<Generator<number>>
```

* `start: number` Initial count value.
* `Return` Current count.

Infinite value generator.

**examples**

```javascript
for (const count of infinity(1)) {
  console.log(count);
}
```

## emitter

```typescript
emitter(emitter: EventEmitter, type: string): Promise<Generator<{event: any, type: string, dispose: () => void}>>
```

* `emitter: EventEmitter` EventEmitter instance.
* `type: string` Event type.
* `Return`
    * `event: any` Emitter arguments.
    * `type: string` EventEmitter event type.
    * `dispose: () => void` Function that dispose current listening event.

Listening and wating event emitter event.

**examples**

```javascript
for await (const {event, dispose} of emitter(em, 'event')) {
  console.log(event);
  // to stop.
  dispose();
  break;
}
```

## poll

```typescript
poll(url: string, options: FetchOption, interval: number = 1000): Promise<Generator<{ok: boolean, response: Response}>>
```

* `url: string` Request endpoint.
* `options: FetchOption` Fetch options.
* `interval: number = 1000` Milliseconds to interval.
* `Return`
    * `ok: boolean` Whether fetch success or not.
    * `response: Response` Fetch response.

Polling with fetch by specified milliseconds.

**examples**

```javascript
for await (const {ok, response} of poll('http://...', {}, 1000)) {
  if (ok) {
    ...
  }
  // to stop.
  break;
}
```

## sse

```typescript
sse(url: string, type: string): Promise<Generator<{event: any, type: string, dispose: () => void}>>
```

* `url: string` Request endpoint.
* `type: string` Event type.
* `Return`
    * `event: any` ServerSentEvent response value.
    * `type: string` SeverSentEvent event type.
    * `dispose: () => void` Dispose event listener.

Listening and waiting ServerSentEvent.

**examples**

```javascript
for await (const {event, dispose} of sse('https://www.ex.com/event', 'request')) {
  const json = JSON.parse(event.data)
  // to stop.
  dispose();
  break;
}
```

## ws

```typescript
ws(url: string, events?: string|string[] = null, socketIO?: SocketIO = null): Promise<Generator<{event: any, type: string, dispose: () => void}>>
```

* `url: string` WebSocket endpoint.
* `events?: string|string[]` Socket.IO additional events. Specifiable only Socket.IO.
* `socketIO?: SocketIO` Socket.IO constructor function.
* `Return`
    * `event: any` Response data.
    * `type: string` Event type (ex. 'connection').
    * `dispose: () => void` Remove websocket handler.

**examples**

```javascript
for await (const {event, type, dispose} of ws('https://www.ex.com/ws', 'request', io)) {
  console.log(event);
  // to stop.
  dispose();
  break;
}
```

## retryable

```typescript
type RetryableOptions = {
  options: FetchOption = {}
  timing: (count: number) => number = () => 1000
  limit: number = 5
  isFailed: (res: Response) => boolean = res => !res.ok
}
```

```typescript
type RetryableResponse = {ok: boolean, response: Response}
```

```typescript
retryable(url: string, options: RetryableOptions): Promise<Generator<RetryableResponse>>
```

* `url: string` Request endpoint.
* `options`
    * `options: FetchOption` `default: {}` Fetch options.
    * `timing: (count: number) => number` `default: () => 1000` Interval timing function.
    * `limit: number` `default: 5` Maximum interval limit.
    * `isFailed: (res: Response) => boolean` `default: res => !res.ok` Function that check fetch request is failed or not.

Retryable fetch wrapper that retry until maximun retry count if request failed.

**examples**

```javascript
async function getJson() {
  return await retryable('http://...', {options: {}});
}
getJson()
```

## stream

```typescript
type StreamOptions = RetryableOptions && {
  // If true, parse response as binary and not convert to string.
  binary: boolean = false;

  // If true, buffering chunk.
  buffering: boolean = true;
}
```

```typescript
type StreamResponse = {
  // Whether fetch succeeded or not.
  ok: boolean

  // CunkReader instance.
  chunk: ChunkReader

  // Whether stream is exit or not.
  done: boolean
}
```

```typescript
class ChunkReader {
  // Read chunk value.
  read(): Uint8Array,

  // Return whether buffered or not.
  isBuffered(): boolean;

  // Return all buffered value that is concatenated as Uint8Array if binary options is true,  
  // or string if binary option is false,  
  // or null if buffering option is false.
  drainBuffer(): Uint8Array|string;

  // Stop reading stream.
  cancel(): void
}
```

```typescript
stream(url: string, options: StreamOptions): Promise<Generator<StreamResponse>>
```

* `url: string` Fetch url
* `options: StreamOptions` See StreamOptions.


## event

```typescript
event(dom: string|HTMLElement, type: string|string[], selector?: string): Promise<Generator<{event: Event, type: string, dispose: () => void}>>
```

* `dom: string|HTMLElement` Target dom node or css selector. If css selector specified and exists more than two element, only first one element is used.
* `type: string|string[]` Listening event type.
* `selector?: string` CSS selector, if specified watch event bubbling like jQuery.live().
* `Return`
    * `event: Event` Event object.
    * `type: string` Event type (ex. 'click').
    * `dispose: () => void` Remove event handler.

Listening and wating dom events.

**examples**

```javascript
for await (const {event, type, dispose} of event('#el', 'click')) {
  console.log(event);
  // to stop.
  dispose();
  break;
}
```
