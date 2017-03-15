
import errorStackParser from 'error-stack-parser';

export default (function parseErrorStack(err) {
  const frames = errorStackParser.parse(err);
  const files = new Map();

  return frames.map(function (line) {
    const fileName = line.fileName;
    let file;

    if (fileName && fileName.startsWith('/')) {
      if (files.has(fileName)) {
        file = files.get(fileName);
      } else {
        files.set(fileName, file = false);
      }
    }

    line.file = file;
    return line;
  });
});
//# sourceMappingURL=parseErrorStack.js.map