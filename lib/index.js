var Buffer = require('buffer').Buffer
var Duplex = require('stream').Duplex

function Buffed(source) {
  Duplex.call(this, { decodeStrings: true })

  if (source) {
    this._source = Array.isArray(source) ? source : [source]
  }
}

// extend Duplex
Buffed.prototype = Object.create(Duplex.prototype)
Buffed.prototype.constructor = Buffed

// read from its source string or send null when it's all sent
Buffed.prototype._read = function(size) {

  if (this._source) {

    switch (this._source.length) {

      case 0:
        this.push(null)
        break

      case 1:
        this.push(this._source.pop())
        break

      default: // op in loop condition

        while (this.push(this._source.shift()) && this._source.length)
          /* noop */ ;
    }

  }

  else {
    this.push(null)
  }
}

// accumulates what's written into `buffers`
Buffed.prototype._write = function(buffer, _, next) {

  // if we already have some then place the new one at the end
  // and add its byte count.
  if (this.buffers) {
    this.buffers[this.buffers.length] = buffer
    this.bufferBytes += buffer.length
  }

  // otherwise, create a new array with the buffer in it
  // and store its byte count.
  else {
    this.buffers = [buffer]
    this.bufferBytes = buffer.length
  }

  next()
}

// combine all the gathered buffers into one buffer
Buffed.prototype.combine = function combine() {

  // will hold a single Buffer with all bytes.
  var combined

  // if we have stored buffers
  if (this.buffers) {

    // determine what to do by the number of buffers we have stored.
    switch (this.buffers.length) {

      case 0: // none, so, create an empty Buffer.
        combined = new Buffer(0)
        break

      case 1: // only one, so, just return that one Buffer.
        combined = this.buffers[0]
        break

      default: // more than one, so concat them all together.
        combined = Buffer.concat(this.buffers, this.bufferBytes)
        // also, take this opportunity to store our work by
        // replacing the array of Buffer's with our new single one.
        // this means calling `combine()` repeatedly will do this work once.
        this.buffers = [combined]
    }

  }

  // otherwise, we have nothing, so, create an empty Buffer.
  else {
    combined = new Buffer(0)
  }

  // return the Buffer result.
  return combined
}

// pipe a buffer to set its source,
// pipe a stream to send its source to the stream.
Buffed.prototype.pipe = function pipe(target) {

  // if:
  //  1. there isn't a target to pipe to
  //  2. or, the target is a Buffer
  //  3. or the target is an array
  if (!target || Buffer.isBuffer(target) || Array.isArray(target)) {
    // give the target to reset()
    return this.reset(target)
  }

  // otherwise, it's a stream, so use the Duplex constructor to
  // reinitialize streaming to this target.
  else {
    return Duplex.prototype.pipe.call(this, target)
  }
}

// make ready to use it again.
// optionally allow a new source.
Buffed.prototype.reset = function reset(source) {

  // initialize with the constructor. we decode strings into bytes.
  Duplex.call(this, { decodeStrings: true })

  // if an optional source was provided then store it as an array.
  // if it's already an array, then use it.
  if (source) {
    this._source = Array.isArray(source) ? source : [source]
  }

  // else there's no new source, so if there's a current source stored
  // then truncate its array to get rid of it.
  else if (this._source){
    this._source.length = 0
  }

  // lastly, if there are stored buffers then truncate its array.
  if (this.buffers) {
    this.buffers.length = 0
  }

  // return this for chaining.
  return this
}


// export a function which creates a Buffed instance.
// avoids them needing to know to use the `new` keyword.
module.exports = function buildBuffed(source) {
  return new Buffed(source)
}

// export the class as a sub property on the function
module.exports.Buffed = Buffed

// export a helper function on our exported function to start piping a buffer.
// it basically accepts a source and creates a Buffed instance with it.
module.exports.pipe = function pipe(source) {

  if (source && ! (Buffer.isBuffer(source) || Array.isArray(source))) {
    throw new TypeError('must provide a buffer or array of buffers to pipe()')
  }

  return new Buffed(source)
}
