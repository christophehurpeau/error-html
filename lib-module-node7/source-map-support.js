import { SourceMapConsumer } from 'source-map';
import { retrieveSourceMap } from 'source-map-support';

export const findSourceMap = source => {
  console.log(source);
  const sourceMap = retrieveSourceMap(source);
  console.log(sourceMap);
  if (!sourceMap) return sourceMap;

  const { url, map } = sourceMap;
  return {
    url,
    map: new SourceMapConsumer(map)
  };
};
//# sourceMappingURL=source-map-support.js.map