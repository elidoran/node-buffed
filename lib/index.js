var Buffer, Duplex;

Buffer = require('buffer').Buffer;
Duplex = require('stream').Duplex;

function Buffed(source) {
  var length;
  Duplex.call(this, { decodeStrings: true });

  if (source) {
    this._source = Array.isArray(source) ? source : [source];
  }
}

// extend Duplex
Buffed.prototype = Object.create(Duplex.prototype);
Buffed.prototype.constructor = Buffed

// read from its source string or send null when it's all sent
Buffed.prototype._read = function(size) {
  if (this._source) {
    switch (this._source.length) {
      case 0: this.push(null); break;
      case 1: this.push(this._source.pop()); break;
      default: // op in loop condition
        while (this.push(this._source.shift()) && this._source.length) ;
    }
  } else {
    this.push(null);
  }
};

// accumulates what's written into `buffers`
Buffed.prototype._write = function(buffer, _, next) {
  var buffers;

  if (this.buffers) {
    this.buffers[this.buffers.length] = buffer
    this.bufferBytes += buffer.length
  } else {
    this.buffers = [buffer]
    this.bufferBytes = buffer.length
  }

  next();
};

// combine all the gathered buffers into one buffer
Buffed.prototype.combine = function combine() {
  var combined;
  if (this.buffers) {
    switch (this.buffers.length) {
      case 0: combined = new Buffer(0); break;
      case 1: combined = this.buffers[0]; break;
      default:
        combined = Buffer.concat(this.buffers, this.bufferBytes);
        this.buffers = [combined];
    }
  } else {
    combined = new Buffer(0);
  }
  return combined;
}

// pipe a buffer to set its source,
// pipe a stream to send its source to the stream.
Buffed.prototype.pipe = function pipe(target) {
  if (!target || Buffer.isBuffer(target) || Array.isArray(target)) {
    return this.reset(target);
  } else {
    return Duplex.prototype.pipe.call(this, target);
  }
};

// make ready to use it again.
Buffed.prototype.reset = function reset(source) {
  Duplex.call(this, { decodeStrings: true });

  if (source) {
    this._source = Array.isArray(source) ? source : [source];
  } else if (this._source){
    this._source.length = 0
  }

  if (this.buffers) {
    this.buffers.length = 0
  }

  return this;
};


// export a function which creates a Buffed instance
module.exports = function buildBuffed(source) {
  return new Buffed(source);
};

// export the class as a sub property on the function
module.exports.Buffed = Buffed;

// export a helper function on our exported function to start piping a buffer
module.exports.pipe = function pipe(source) {
  if (source && ! (Buffer.isBuffer(source) || Array.isArray(source))) {
    throw new TypeError('must provide a buffer or array of buffers to pipe()');
  }

  return new Buffed(source);
};
