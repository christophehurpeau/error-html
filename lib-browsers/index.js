'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* eslint-disable max-len, max-lines */

var _escapeHtml = require('escape-html');

var _escapeHtml2 = _interopRequireDefault(_escapeHtml);

var _eshighlightFb = require('eshighlight-fb');

var _eshighlightFb2 = _interopRequireDefault(_eshighlightFb);

var _parseErrorStack = require('./parseErrorStack');

var _parseErrorStack2 = _interopRequireDefault(_parseErrorStack);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function tag(tagName, attributes, content, contentEscape) {
  attributes = attributes || {};
  var str = '';
  Object.keys(attributes).forEach(function (key) {
    str += ' ' + key;
    if (attributes[key]) {
      str += '="' + (attributes[key] === true ? key : (0, _escapeHtml2.default)(attributes[key])) + '"';
    }
  });

  return '<' + tagName + str + (content == null ? '/' : '>' + (contentEscape ? (0, _escapeHtml2.default)(content) : content) + '</' + tagName) + '>';
}

var HtmlRenderer = function () {
  function HtmlRenderer(options) {
    _classCallCheck(this, HtmlRenderer);

    this.options = Object.assign({
      fileProtocol: 'file'
    }, options);
  }

  /**
   * @ignore
   */


  _createClass(HtmlRenderer, [{
    key: 'openLocalFile',
    value: function openLocalFile(filePath, lineNumber, columnNumber) {
      if (this.generatedPath && this.sourcePath && filePath.startsWith(this.generatedPath)) {
        filePath = this.sourcePath + filePath.substr(this.generatedPath.length);
      }

      return '<a download href="' + this.options.fileProtocol + '://' + (0, _escapeHtml2.default)(filePath) + ((!lineNumber ? '' : '?' + lineNumber + (!columnNumber ? '' : ':' + columnNumber)) + '">');
    }

    /**
     * @ignore
     */

  }, {
    key: 'replaceAppInFilePath',
    value: function replaceAppInFilePath(filePath) {
      if (!filePath) return 'unknown';

      if (this.appPath) {
        filePath = 'APP/' + filePath.substr(this.appPath.length);
      }

      return filePath;
    }

    /**
     * @ignore
     */

  }, {
    key: 'render',
    value: function render(error) {
      var str = '<div style="text-align: left">';
      str += '<h1>' + error.name + '</h1>\n';
      if (error.message) {
        str += '<pre style="background:#FFF;color:#222;border:0;font-size:1em;white-space:pre-wrap;word-wrap:break-word">';
        str += (0, _escapeHtml2.default)(error.message);
        str += '</pre>';
      }

      if (!this.options.production) {
        str += '<h5 style="background:#FFDDAA;color:#333;border:1px solid #E07308;padding:1px 2px;">Stack:</h5>\n';
        str += '<pre style="background:#FFF;color:#222;border:0">' + this.renderStack(error) + '</pre>';
        str += '<small><em>Click on the line number to display/hide the content file !</em></small>';

        str += '<h5 style="background:#FFDDAA;color:#333;border:1px solid #E07308;padding:1px 2px;">Source Stack:</h5>\n';
        str += '<pre style="background:#FFF;color:#222;border:0">' + (0, _escapeHtml2.default)(error.stack) + '</pre>';
      }

      return str;
    }

    /**
     * @ignore
     */

  }, {
    key: 'renderStack',
    value: function renderStack(error) {
      var _this = this;

      var frames = (0, _parseErrorStack2.default)(error);

      var str = '<style>.string{ color: #EC7600; }\n.keyword, .null{ font-weight: bold; color: #93C763; }\n.numeric{ color: #FACD22; }\n.line-comment{ color: #66747B; }\n.identifier{ }\n.control-flow{ color: #93C763; }\n.azerty1{ color: #66747B; }\n.azerty2{ color: #678CB1; }\n.azerty5{ color: #F1F2F3; }\n.azerty6{ color: #8AC763; }\n.azerty7{ color: #E0E2E4; }\n.azerty9{ color: purple; }\n</style>';
      frames.forEach(function (frame, i) {
        if (frame.file && frame.file.contents) {
          str += '<span><a href="javascript:;" style="color:#CC7A00;text-decoration:none;outline:none;cursor:pointer" '
          // eslint-disable-next-line
          + 'onclick="var el=this.parentNode.nextElementSibling; el.style.display=el.style.display==\'none\'?\'block\':\'none\';">';
        }

        str += '#' + i + ' ';
        if (!frame.isNative && !frame.isEval) {
          var fileName = frame.fileName;
          if (fileName.startsWith('file://')) fileName = fileName.substr('file://'.length);

          if (fileName && fileName.startsWith('/')) {
            str += _this.openLocalFile(fileName, frame.lineNumber, frame.columnNumber);
          }

          str += _this.replaceAppInFilePath(fileName);
          if (frame.lineNumber !== null || frame.columnNumber !== null) {
            str += ':' + frame.lineNumber + ':' + frame.columnNumber;
          }

          if (fileName && fileName.startsWith('/')) {
            str += '</a>';
          }

          str += ' ';
        }

        if (frame.functionName) {
          str += frame.functionName;
        } else if (frame.typeName) {
          str += frame.typeName + '.' + (frame.methodName || '<anonymous>');
        }

        if (frame.isNative) {
          str += ' [native]';
        }

        if (frame.isEval) {
          str += ' [eval]';
        }

        if (frame.file && frame.file.contents) {
          str += '</a></span>';
          str += '<div style="display:' + (i === 0 ? 'block' : 'none') + '">';

          str += '<div style="margin-top: 5px">';
          str += '<b>File content :</b><br />';
          str += _this.highlightLine(frame.file.contents, frame.lineNumber, frame.columnNumber);
          str += '</div>';

          str += '</div>';
        }

        str += '\n';
      });

      return str;
    }

    /**
     * @ignore
     */

  }, {
    key: 'highlightLine',
    value: function highlightLine(contents, lineNumber /* , columnNumber */) {
      var withLineNumbers = true;
      var minmax = 4;

      var hcontents = void 0;
      try {
        hcontents = (0, _eshighlightFb2.default)(contents);
      } catch (err) {
        hcontents = (0, _escapeHtml2.default)(contents);
      }

      hcontents = hcontents.split(/\r\n|\n\r|\n|\r/);

      var ok = lineNumber <= hcontents.length;
      var firstLine = void 0;
      var start = void 0;
      var lineContent = void 0;
      var end = void 0;

      if (ok) {
        firstLine = Math.max(0, lineNumber - 1 - minmax);
        start = hcontents.slice(firstLine, lineNumber - 1);
        lineContent = lineNumber === 0 ? '' : hcontents[lineNumber - 1];
        end = hcontents.slice(lineNumber, lineNumber + minmax);
      } else {
        start = hcontents;
      }

      /* if (withLineNumbers) {
          // $withLineNumbers = '%'.strlen((string)($ok ? $line+$minmax : $minmax+1)).'d';
      } */

      var content = this.lines(withLineNumbers, ok ? firstLine + 1 : 1, start);
      if (ok) {
        content += this.line(withLineNumbers, lineNumber, { style: 'background:#3F1F1F;' }, lineContent);
        content += this.lines(withLineNumbers, lineNumber + 1, end);
      }

      return tag('pre', { style: 'background:#0F0F0F;color:#E0E2E4;border:0;padding:0;position:relative;' }, content, false);
    }

    /**
     * @ignore
     */

  }, {
    key: 'lines',
    value: function lines(withLineNumbers, startNumber, _lines) {
      var _this2 = this;

      var content = '';
      _lines.forEach(function (line) {
        content += _this2.line(withLineNumbers, startNumber + 1, {}, line);
      });
      return content;
    }

    /**
     * @ignore
     */

  }, {
    key: 'line',
    value: function line(withLineNumbers, lineNumber, attributes, contentLine) {
      attributes.style = (attributes.style || '') + 'white-space:pre-wrap;' + ('' + (withLineNumbers ? 'padding-left:20px;' : ''));

      if (withLineNumbers) {
        contentLine = '<i style="color:#AAA;font-size:7pt;position:absolute;left:1px;padding-top:1px;">' + (lineNumber + '</i>' + contentLine);
      }

      return tag('div', attributes, contentLine);
    }
  }]);

  return HtmlRenderer;
}();

exports.default = HtmlRenderer;
//# sourceMappingURL=index.js.map