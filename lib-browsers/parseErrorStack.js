'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _errorStackParser = require('error-stack-parser');

var _errorStackParser2 = _interopRequireDefault(_errorStackParser);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (err) {
  var frames = _errorStackParser2.default.parse(err);
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
};
//# sourceMappingURL=parseErrorStack.js.map