'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _stackTrace = require('stack-trace');

var _stackTrace2 = _interopRequireDefault(_stackTrace);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (err) {
  var stack = _stackTrace2.default.parse(err);

  var files = new Map();

  return stack.map(function (line) {
    var fileName = line.fileName;
    var file = void 0;

    if (fileName && fileName.startsWith('/')) {
      if (files.has(fileName)) {
        file = files.get(fileName);
      } else {
        file = {};
        try {
          var fileContent = (0, _fs.readFileSync)(fileName).toString();
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
//# sourceMappingURL=parseErrorStack.js.map