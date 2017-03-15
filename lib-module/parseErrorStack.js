
import errorStackParser from 'error-stack-parser';

export default (function (err) {
  var frames = errorStackParser.parse(err);
  var files = new Map();

  return frames.map(function (line) {
    var fileName = line.fileName;
    var file = void 0;

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