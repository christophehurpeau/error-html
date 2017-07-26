import { SourceMapConsumer } from 'source-map';
import { retrieveSourceMap } from 'source-map-support';

export const findSourceMap = (source: string) => {
  const sourceMap = retrieveSourceMap(source);
  if (!sourceMap) return sourceMap;

  const { url, map } = sourceMap;
  return {
    url,
    map: new SourceMapConsumer(map),
  };
};
