'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findSourceMap = undefined;

var _sourceMap = require('source-map');

var _sourceMapSupport = require('source-map-support');

const findSourceMap = exports.findSourceMap = source => {
  const sourceMap = (0, _sourceMapSupport.retrieveSourceMap)(source);
  if (!sourceMap) return sourceMap;

  const { url, map } = sourceMap;
  return {
    url,
    map: new _sourceMap.SourceMapConsumer(map)
  };
};
//# sourceMappingURL=source-map-support.js.map