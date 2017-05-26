var assert, buffed, listeners, sinker, sourceBuffer, sourceContent, thru;

assert = require('assert');
buffed = require('../../lib');
// prettier-ignore
thru   = require('through2');
sinker = require('../helpers/sinker');

sourceContent = 'the source content';
// prettier-ignore
sourceBuffer  = Buffer.from(sourceContent);

listeners = function(source, target, done, verify) {
  source.on('error', done);
  target.on('error', done);
  target.on('finish', done);
  if (verify != null) {
    return target.on('finish', verify);
  }
};

describe('test buffed', function() {
  // test this three ways:
  //  1. create Buffed with source and pipe it to target stream.
  //  2. create Buffed w/out source and pipe Buffer source to target stream.
  //  3. use Buffed.pipe() to create it with source and pipe it to target stream.
  [
    [ // explain, builder: (content, target)
      'constructor', function(c, t) {
        var source;
        source = buffed(c);
        source.pipe(t);
        return source;
      }
    ], [
      'reset by pipe', function(c, t) {
        var source;
        source = buffed();
        source.pipe(c).pipe(t);
        return source;
      }
    ], [
      'create by pipe', function(c, t) {
        var source;
        source = buffed.pipe(c);
        source.pipe(t);
        return source;
      }
    ]
  ].forEach(function(arg) {
    var builder, explain;

    explain = arg[0], builder = arg[1];

    describe(explain, function() {

      it('as empty source', function(done) {
        var source, target;

        target = sinker();
        source = builder(null, target);

        listeners(source, target, done, function() {
          assert.equal(source._source, null);
          assert.equal(target.buffers, null);
        });
      });

      it('as source from buffer', function(done) {
        var source, target;

        target = sinker();
        source = builder(sourceBuffer, target);

        listeners(source, target, done, function() {
          var ref;
          assert.equal((source._source && source._source.length), 0);
          assert.equal((target.buffers && target.buffers.length), 1);
          assert.deepEqual(target.buffers[0], sourceBuffer);
        });
      });

      it('as source from array', function(done) {
        var source, target;

        target = sinker();
        source = builder([sourceBuffer], target);

        listeners(source, target, done, function() {
          var ref;
          assert.equal((source._source && source._source.length), 0);
          assert.equal((target.buffers && target.buffers.length), 1);
          assert.deepEqual(target.buffers[0], sourceBuffer);
        });
      });

      it('as source from array w/2', function(done) {
        var source, target;

        target = sinker();
        source = builder([sourceBuffer, sourceBuffer], target);

        listeners(source, target, done, function() {
          var ref;
          assert.equal((source._source && source._source.length), 0);
          assert.equal((target.buffers && target.buffers.length), 2);
          assert.deepEqual(target.buffers[0], sourceBuffer);
          assert.deepEqual(target.buffers[1], sourceBuffer);
        });
      });
    });
  });

  it('read()', function() {
    var result, source;

    source = buffed([sourceBuffer, sourceBuffer]);
    result = source.read(sourceBuffer.length);

    assert(result);
    assert.equal(result.length, sourceBuffer.length);
    assert.deepEqual(result, sourceBuffer);
    result = source.read(sourceBuffer.length);

    assert(result);
    assert.equal(result.length, sourceBuffer.length);
    assert.deepEqual(result, sourceBuffer);
    assert.equal(source._source.length, 0);
  });

  it('exported pipe() errors with non-null non-buffer non-array', function() {
    assert.throws(function() {
      buffed.pipe(new Date);
    });
  });

  it('reset() with previous source', function() {
    var source;
    source = buffed(sourceBuffer);
    source.reset();
    assert.deepEqual(source._source, []);
  });

  it('combine() w/out buffers', function() {
    var combined, writable;
    writable = buffed();
    combined = writable.combine();
    assert.deepEqual(combined, Buffer.concat([], 0));
  });

  it('combine() w/empty buffers', function() {
    var combined, writable;
    writable = buffed();
    writable.buffers = [];
    combined = writable.combine();
    assert.deepEqual(combined, Buffer.concat([], 0));
  });

  it('write() and combine() (1)', function() {
    var combined, writable;
    writable = buffed();
    writable.write(sourceBuffer);
    assert.deepEqual(writable.buffers, [sourceBuffer]);
    combined = writable.combine();
    assert.deepEqual(combined, Buffer.concat([sourceBuffer]));
  });

  it('write() and combine() (2)', function() {
    var combined, writable;
    writable = buffed();
    writable.write(sourceBuffer);
    assert.deepEqual(writable.buffers, [sourceBuffer]);
    writable.write(sourceBuffer);
    assert.deepEqual(writable.buffers, [sourceBuffer, sourceBuffer]);
    combined = writable.combine();
    assert.deepEqual(combined, Buffer.concat([sourceBuffer, sourceBuffer]));
  });

  it('reset() with buffers', function() {
    var writable;
    writable = buffed();
    writable.write(sourceBuffer);
    writable.write(sourceBuffer);
    assert.deepEqual(writable.buffers, [sourceBuffer, sourceBuffer]);
    writable.reset();
    assert.deepEqual(writable.buffers, []);
  });
});
