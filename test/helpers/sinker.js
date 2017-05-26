module.exports = function() {
  return require('through2')(function (chunk, _, next) {
    if (this.buffers != null) {
      this.buffers[this.buffers.length] = chunk
    } else {
      this.buffers = [chunk]
    }
    next()
  })
}
