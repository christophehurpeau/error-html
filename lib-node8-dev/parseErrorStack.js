'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _errorStackParser = require('error-stack-parser');

var _errorStackParser2 = _interopRequireDefault(_errorStackParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function parseErrorStack(err) {
  const frames = _errorStackParser2.default.parse(err);
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
          const fileContent = (0, _fs.readFileSync)(fileName).toString();
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
};
//# sourceMappingURL=parseErrorStack.js.map