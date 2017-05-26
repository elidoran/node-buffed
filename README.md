# buffed
[![Build Status](https://travis-ci.org/elidoran/node-buffed.svg?branch=master)](https://travis-ci.org/elidoran/node-buffed)
[![Dependency Status](https://gemnasium.com/elidoran/node-buffed.png)](https://gemnasium.com/elidoran/node-buffed)
[![npm version](https://badge.fury.io/js/buffed.svg)](http://badge.fury.io/js/buffed)
[![Coverage Status](https://coveralls.io/repos/github/elidoran/node-buffed/badge.svg?branch=master)](https://coveralls.io/github/elidoran/node-buffed?branch=master)

Acts as a stream to send a buffer, gather a buffer, or both.


## Install

```sh
npm install --save buffed
```


## Usage

Show:

1. using it as a source (a Readable with buffer content)
2. using it as a sink (a Writable collecting buffer chunks)
3. as both a source and a sink at once
4. getting its class
5. resetting an instance with a new buffer (to use as a source)
6. resetting an instance with `pipe(buffer)` (to use as a source)

```javascript
// reused in examples below.
var buffer = getSomeBuffer()

// NOTE: everywhere you see `buffer` as an arg to
// methods, including the constructor,
// you could provide an array of buffers instead.

// Piping out: Buffed as a source

// 1a. create instance with string to pipe out
var buffed = require('buffed')(buffer)

// 1b. pipe string to another stream
buffed.pipe(anotherStream)


// 2a. get buffed function to use to create instances
var Buffed = require('buffed')

// 2b. create an instance with a string and pipe it to another stream
Buffed(buffer).pipe(anotherStream)

//  or:
Buffed.pipe(buffer).pipe(anotherStream)


// Piping in: Buffed as a sink

// 3a. get buffed function to create an instance
var Buffed = require('buffed')

// 3b. create a source buffed
var sink = Buffed()

// combine 3a and 3b:
var sink = require('buffed')()

// 3c. use event to get full string from sink
sink.on('finish', function() {
  console.log('collected buffers:',sink.buffers)
  console.log('as single buffer:', sink.combine())
})

// 3d. pipe stream to buffed
anotherStream.pipe(sink)


// Both source and sink

// 4a. get instance from function (like 1a)
var buffed = require('buffed')(buffer)

// 4b. use event to get full string from it
buffed.on('finish', function() {
  console.log('collected buffers:',sink.buffers)
  console.log('as single buffer:', sink.combine())
})

// 4c. pipe to another stream and then back to itself
buffed.pipe(anotherStream).pipe(buffed)


// Separate instances for source and sink

// 5a. get function to create instances
var buffed = require('buffed')

// 5b. create a source
var source = buffed(buffer)

// 5c. create a sink
var sink = buffed()

// 5d. use event to get full string from sink
sink.on('finish', function() {
  console.log('collected buffers:',sink.buffers)
  console.log('as single buffer:', sink.combine())
})

// 5e. pipe source thru another stream to sink
source.pipe(anotherStream).pipe(sink)


// the Buffed class is also exported as a subproperty

// 6a. get class
var Buffed = require('buffed').Buffed

// 6b. create an instance as a source (has a string) (can be a sink, too)
var source = new Buffed(buffer)

// 6c. create an instance as a sink (no string)
var sink = new Buffed


// Reset buffed instance with new string

// 7a. create a buffed instance
var buffed = require('buffed')(buffer)

// 7b. use event to continue when it's done:
buffed.on('finish', function() {
  console.log('collected buffers:',sink.buffers)
  console.log('as single buffer:', sink.combine())

  // 7d. reuse it to pipe something else via reset
  buffed.reset(getNewBuffer()).pipe(differentStream).pipe(buffed)

  // OR:
  // 7e. call pipe with a string which does a reset and returns itself
  buffed.pipe(getNewBuffer()).pipe(differentStream).pipe(buffed)
})

// 7c. use buffed
buffed.pipe(anotherStream).pipe(buffed)


// ES6 version:
import Buffed from 'buffed'

const source = new Buffed(buffer)
const sink   = new Buffed()

source.pipe(anotherStream).pipe(sink)

sink.on('finish', () =>
  console.log('collected buffers:',sink.buffers)
  console.log('as single buffer:', sink.combine())
)
```


## [MIT License](LICENSE)
