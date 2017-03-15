import { readFileSync } from 'fs';
import errorStackParser from 'error-stack-parser';

export default (function parseErrorStack(err) {
  const frames = errorStackParser.parse(err);
  const files = new Map();

  return frames.map(line => {
    const fileName = line.fileName;
    let file;

    if (fileName && fileName.startsWith('/')) {
      if (files.has(fileName)) {
        file = files.get(fileName);
      } else {
        file = {};
        try {
          const fileContent = readFileSync(fileName).toString();
          file.fileName = fileName;
          file.contents = fileContent;
          files.set(fileName, file);
        } catch (e) {
          files.set(fileName, file = false);
        }
      }
    }

    line.file = file;
    return line;
  });
});
//# sourceMappingURL=parseErrorStack.js.map