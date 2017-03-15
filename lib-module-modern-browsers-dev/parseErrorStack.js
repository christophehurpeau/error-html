
import errorStackParser from 'error-stack-parser';
import { findSourceMap } from './source-map-support';

export default (function parseErrorStack(err) {
  const frames = errorStackParser.parse(err);
  const cache = new Map();

  return frames.map(function (frame) {
    if (frame.isNative || frame.isEval) return frame;

    frame.fileName;

    let file;

    {
      let sourceMap;
      const source = frame.getFileName();

      if (!source) return frame;

      if (cache.has(source)) {
        sourceMap = cache.get(source);
      } else {
        sourceMap = findSourceMap(source);
        cache.set(source, sourceMap);
      }

      if (sourceMap) {
        const originalPosition = sourceMap.map.originalPositionFor({
          source,
          line: frame.lineNumber,
          column: frame.columnNumber - 1
        });

        if (originalPosition.source !== null) {
          frame.fileName = originalPosition.source;
          frame.lineNumber = originalPosition.line;
          frame.columnNumber = originalPosition.column + 1;

          if (sourceMap.map.sourcesContent) {
            const indexSourceContent = sourceMap.map.sources.indexOf(originalPosition.source);
            if (indexSourceContent !== -1) {
              file = {
                fileName: originalPosition.source,
                contents: sourceMap.map.sourcesContent[indexSourceContent]
              };
            }
          }
        }
      }
    }

    frame.file = file;
    return frame;
  });
});
//# sourceMappingURL=parseErrorStack.js.map