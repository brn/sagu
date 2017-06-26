# Sagu

Simple Async Generator Utils

Game changer of javascript asynchronous process.

**Sagu how change async process of javascript?**

### Event

**So far**

```javascript
const a = document.querySelector('a');
a.addEventListener('click', e => console.log(e.target.nodeName));
```

**With sagu**
```javascript
const a = document.querySelector('a');
for await (const {event, dispose} of event(a, 'click')) {
  console.log(event.target.nodeName);
}
```


### Polling

**So far**

```javascript
// polling.
async function poll() {
  const res = await fetch('https://sample.com');
  const json = res.json();
  ...
  setTimeout(poll, 1000);
};
poll();
```

**With sagu**
```javascript
// polling
for await (const {ok, response} of poll('https://sample.com', {}, 1000)) {
  const json = await response.json();
  ...
}
```

etc...


#### Sagu convert callback async function to simple loops.


## Install

`npm install sagu --save`

## Import

*ES6*

```javascript
import {
  wait,
  ws
} from 'sagu';
```

*Node*

```javascript
const {
  wait,
  ws
} = require('sagu');
```

*Script*

```html
<script src="<path to sagu>/sagu/dist/index-iife.js"></script>
<script>console.log(sagu.wait)</script>
```

### For rollup users

Use `rollup-plugin-node-resolve` with `module: true`.

### For Webpack or other bundler users

Import normaly.

## Environment

Sagu only works for environment which support asynchronous iterater(for-await-of).  
Now only babel support that feature.  
So now we support only babel transpilation.

### babel config.

```
"babel": {
  "plugins": [
    [
      "transform-runtime",
      {
        "helpers": false,
        "polyfill": false,
        "regenerator": true,
        "moduleName": "babel-runtime"
      }
    ]
  ],
  "presets": [
    "es2015",
    "stage-3"
  ]
}
```

You must specify `stage-3` presets and transform-runtime.  
In detail,see  
[https://github.com/babel/babel/pull/3473](https://github.com/babel/babel/pull/3473)  
[https://github.com/tc39/proposal-async-iteration](https://github.com/tc39/proposal-async-iteration)


