
import errorStackParser from 'error-stack-parser';
import { findSourceMap } from './source-map-support';

export default (function parseErrorStack(err) {
  var frames = errorStackParser.parse(err);
  var cache = new Map();

  return frames.map(function (frame) {
    if (frame.isNative || frame.isEval) return frame;

    frame.fileName;

    var file = void 0;

    {
      var sourceMap = void 0;
      var source = frame.getFileName();

      if (!source) return frame;

      if (cache.has(source)) {
        sourceMap = cache.get(source);
      } else {
        sourceMap = findSourceMap(source);
        cache.set(source, sourceMap);
      }

      if (sourceMap) {
        var originalPosition = sourceMap.map.originalPositionFor({
          source: source,
          line: frame.lineNumber,
          column: frame.columnNumber - 1
        });

        if (originalPosition.source !== null) {
          frame.fileName = originalPosition.source;
          frame.lineNumber = originalPosition.line;
          frame.columnNumber = originalPosition.column + 1;

          if (sourceMap.map.sourcesContent) {
            var indexSourceContent = sourceMap.map.sources.indexOf(originalPosition.source);
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