'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var fs = require('fs');
var errorStackParser = _interopDefault(require('error-stack-parser'));
var escape = _interopDefault(require('escape-html'));
var highlight = _interopDefault(require('eshighlight-fb'));

var parseErrorStack = (function (err) {
  var frames = errorStackParser.parse(err);
  var cache = new Map();

  return frames.map(function (frame) {
    if (frame.isNative || frame.isEval) return frame;

    var fileName = frame.fileName;
    var file = void 0;

    if (fileName && fileName.startsWith('/')) {
      if (cache.has(fileName)) {
        file = cache.get(fileName);
      } else {
        file = {};
        try {
          var fileContent = fs.readFileSync(fileName).toString();
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
});

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();

/* eslint-disable max-len, max-lines, prettier/prettier */

function tag(tagName, attributes, content, contentEscape) {
  attributes = attributes || {};
  var str = '';
  Object.keys(attributes).forEach(function (key) {
    str += ` ${key}`;
    if (attributes[key]) {
      str += `="${attributes[key] === true ? key : escape(attributes[key])}"`;
    }
  });

  return `<${tagName}${str}${content == null ? '/' : `>${contentEscape ? escape(content) : content}</${tagName}`}>`;
}

var HtmlRenderer = function () {
  function HtmlRenderer(options) {
    classCallCheck(this, HtmlRenderer);

    this.options = Object.assign({
      fileProtocol: 'file'
    }, options);
  }

  /**
   * @ignore
   */


  createClass(HtmlRenderer, [{
    key: 'openLocalFile',
    value: function openLocalFile(filePath, lineNumber, columnNumber) {
      if (this.generatedPath && this.sourcePath && filePath.startsWith(this.generatedPath)) {
        filePath = this.sourcePath + filePath.substr(this.generatedPath.length);
      }

      return `<a download href="${this.options.fileProtocol}://${escape(filePath)}` + `${!lineNumber ? '' : `?${lineNumber}${!columnNumber ? '' : `:${columnNumber}`}`}">`;
    }

    /**
     * @ignore
     */

  }, {
    key: 'replaceAppInFilePath',
    value: function replaceAppInFilePath(filePath) {
      if (!filePath) return 'unknown';

      if (this.options.appPath) {
        filePath = `APP/${filePath.substr(this.options.appPath.length)}`;
      }

      return filePath;
    }

    /**
     * @param {Error} error
     */

  }, {
    key: 'render',
    value: function render(error) {
      var str = '<div style="text-align: left">';
      str += `<h1 style="background:#FFF;color:#E07308;border:0;font-size:4em;margin:0;padding:1px 2px;">${error.name}</h1>\n`;
      if (error.message) {
        str += '<pre style="background:#FFF;color:#222;border:0;font-size:1em;margin:5px 0 0;padding: 0;white-space:pre-wrap;word-wrap:break-word">';
        str += escape(error.message);
        str += '</pre>';
      }

      if (!this.options.production) {
        str += '<h5 style="background:#FFDDAA;color:#333;border:1px solid #E07308;margin:10px 0 0;padding:1px 2px;">Stack:</h5>\n';
        str += `<pre style="background:#FFF;color:#222;border:0;margin:0">${this.renderStack(error)}</pre>`;
        str += '<small><em>Click on the line number to display/hide the content file !</em></small>';

        str += '<h5 style="background:#FFDDAA;color:#333;border:1px solid #E07308;margin:0;padding:1px 2px;">Source Stack:</h5>\n';
        str += `<pre style="background:#FFF;color:#222;border:0;margin:0">${escape(error.stack)}</pre>`;
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

      var frames = parseErrorStack(error);

      var str = `<style>.string{ color: #EC7600; }
.keyword, .null{ font-weight: bold; color: #93C763; }
.numeric{ color: #FACD22; }
.line-comment{ color: #66747B; }
.identifier{ }
.control-flow{ color: #93C763; }
.azerty1{ color: #66747B; }
.azerty2{ color: #678CB1; }
.azerty5{ color: #F1F2F3; }
.azerty6{ color: #8AC763; }
.azerty7{ color: #E0E2E4; }
.azerty9{ color: purple; }
</style>`;
      frames.forEach(function (frame, i) {
        if (frame.file && frame.file.contents) {
          str += '<span><a href="javascript:;" style="color:#CC7A00;text-decoration:none;outline:none;cursor:pointer" '
          // eslint-disable-next-line
          + `onclick="var el=this.parentNode.nextElementSibling; el.style.display=el.style.display=='none'?'block':'none';">`;
        }

        str += `#${i} `;
        if (!frame.isNative && !frame.isEval) {
          var fileName = frame.fileName;
          if (fileName.startsWith('file://')) fileName = fileName.substr(7);

          if (fileName && fileName.startsWith('/')) {
            str += _this.openLocalFile(fileName, frame.lineNumber, frame.columnNumber);
          }

          str += _this.replaceAppInFilePath(fileName);
          if (frame.lineNumber !== null || frame.columnNumber !== null) {
            str += `:${frame.lineNumber}:${frame.columnNumber}`;
          }

          if (fileName && fileName.startsWith('/')) {
            str += '</a>';
          }

          str += ' ';
        }

        if (frame.functionName) {
          str += frame.functionName;
        } else if (frame.typeName) {
          str += `${frame.typeName}.${frame.methodName || '<anonymous>'}`;
        }

        if (frame.isNative) {
          str += ' [native]';
        }

        if (frame.isEval) {
          str += ' [eval]';
        }

        if (frame.file && frame.file.contents) {
          str += '</a></span>';
          str += `<div style="display:${i === 0 ? 'block' : 'none'}">`;

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
        hcontents = highlight(contents);
      } catch (err) {
        hcontents = escape(contents);
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
      attributes.style = `${attributes.style || ''}white-space:pre-wrap;` + `${withLineNumbers ? 'padding-left:20px;' : ''}`;

      if (withLineNumbers) {
        contentLine = '<i style="color:#AAA;font-size:7pt;position:absolute;left:1px;padding-top:1px;">' + `${lineNumber}</i>${contentLine}`;
      }

      return tag('div', attributes, contentLine);
    }
  }]);
  return HtmlRenderer;
}();

module.exports = HtmlRenderer;
//# sourceMappingURL=index-node4-dev.cjs.js.map
