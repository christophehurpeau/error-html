
import stackTrace from 'stack-trace';

export default (function (err) {
  var stack = stackTrace.parse(err);

  var files = new Map();

  return stack.map(function (line) {
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