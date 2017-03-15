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

const findSourceMap = exports.findSourceMap = source => {
  let _sourceType = _flowRuntime2.default.string();

  _flowRuntime2.default.param('source', _sourceType).assert(source);

  console.log(source);
  const sourceMap = (0, _sourceMapSupport.retrieveSourceMap)(source);
  console.log(sourceMap);
  if (!sourceMap) return sourceMap;

  const { url, map } = sourceMap;
  return {
    url,
    map: new _sourceMap.SourceMapConsumer(map)
  };
};
//# sourceMappingURL=source-map-support.js.map