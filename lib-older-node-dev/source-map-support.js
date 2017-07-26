'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findSourceMap = undefined;

var _sourceMap = require('source-map');

var _sourceMapSupport = require('source-map-support');

var _flowRuntime = require('flow-runtime');

var _flowRuntime2 = _interopRequireDefault(_flowRuntime);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var findSourceMap = exports.findSourceMap = function findSourceMap(source) {
  var _sourceType = _flowRuntime2.default.string();

  _flowRuntime2.default.param('source', _sourceType).assert(source);

  var sourceMap = (0, _sourceMapSupport.retrieveSourceMap)(source);
  if (!sourceMap) return sourceMap;

  var url = sourceMap.url,
      map = sourceMap.map;

  return {
    url,
    map: new _sourceMap.SourceMapConsumer(map)
  };
};
//# sourceMappingURL=source-map-support.js.map