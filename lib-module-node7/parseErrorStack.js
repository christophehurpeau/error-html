import { readFileSync } from 'fs';
import errorStackParser from 'error-stack-parser';


export default (err => {
  const frames = errorStackParser.parse(err);
  const cache = new Map();

  return frames.map(frame => {
    if (frame.isNative || frame.isEval) return frame;

    const fileName = frame.fileName;
    let file;

    if (fileName && fileName.startsWith('/')) {
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
          cache.set(fileName, file = false);
        }
      }
    }

    frame.file = file;
    return frame;
  });
});
//# sourceMappingURL=parseErrorStack.js.map