import { readFileSync } from 'fs';
import errorStackParser from 'error-stack-parser';
import { findSourceMap } from './source-map-support';

export default err => {
  const frames = errorStackParser.parse(err);
  const cache = new Map();

  return frames.map(frame => {
    if (frame.isNative || frame.isEval) return frame;

    const fileName = frame.fileName;
    let file;

    if (BROWSER) {
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
          column: frame.columnNumber - 1,
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
                contents: sourceMap.map.sourcesContent[indexSourceContent],
              };
            }
          }
        }
      }
    } else if (fileName && fileName.startsWith('/')) {
      if (cache.has(fileName)) {
        file = cache.get(fileName);
      } else {
        file = {};
        try {
          const fileContent = readFileSync(fileName).toString();
          file.fileName = fileName;
          file.contents = fileContent;
          cache.set(fileName, file);
        } catch (e) {
          cache.set(fileName, (file = false));
        }
      }
    }

    frame.file = file;
    return frame;
  });
};
