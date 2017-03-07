
import stackTrace from 'stack-trace';

export default (function (err) {
  let stack = stackTrace.parse(err);

  const files = new Map();

  return stack.map(function (line) {
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