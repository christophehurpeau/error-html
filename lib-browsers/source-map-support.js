'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findSourceMap = undefined;

var _sourceMap = require('source-map');

var _sourceMapSupport = require('source-map-support');

var findSourceMap = exports.findSourceMap = function findSourceMap(source) {
  console.log(source);
  var sourceMap = (0, _sourceMapSupport.retrieveSourceMap)(source);
  console.log(sourceMap);
  if (!sourceMap) return sourceMap;

  var url = sourceMap.url,
      map = sourceMap.map;

  return {
    url: url,
    map: new _sourceMap.SourceMapConsumer(map)
  };
};
//# sourceMappingURL=source-map-support.js.map