import { readFileSync } from 'fs';
import stackTrace from 'stack-trace';

export default (err) => {
  let stack = stackTrace.parse(err);

  const files = new Map();

  return stack.map((line) => {
    const fileName = line.fileName;
    let file;

    if (fileName && fileName.startsWith('/')) {
      if (files.has(fileName)) {
        file = files.get(fileName);
      } else if (BROWSER) {
        files.set(fileName, file = false);
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
};
