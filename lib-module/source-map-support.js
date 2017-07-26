import { SourceMapConsumer } from 'source-map';
import { retrieveSourceMap } from 'source-map-support';

export var findSourceMap = function findSourceMap(source) {
  var sourceMap = retrieveSourceMap(source);
  if (!sourceMap) return sourceMap;

  var url = sourceMap.url,
      map = sourceMap.map;

  return {
    url: url,
    map: new SourceMapConsumer(map)
  };
};
//# sourceMappingURL=source-map-support.js.map