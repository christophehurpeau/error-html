# error-html [![NPM version][npm-image]][npm-url]

render error stack in html

[![Dependency ci Status][dependencyci-image]][dependencyci-url]
[![Dependency Status][daviddm-image]][daviddm-url]

## Install

```bash
npm install --save error-html
```

## Usage

```js
import ErrorHtmlRenderer from 'error-html';

const errorHtmlRenderer = new ErrorHtmlRenderer({
  appPath: process.cwd(),
});

console.log(errorHtmlRenderer.render(new Error()));
```

[npm-image]: https://img.shields.io/npm/v/error-html.svg?style=flat-square
[npm-url]: https://npmjs.org/package/error-html
[daviddm-image]: https://david-dm.org/christophehurpeau/error-html.svg?style=flat-square
[daviddm-url]: https://david-dm.org/christophehurpeau/error-html
[dependencyci-image]: https://dependencyci.com/github/christophehurpeau/error-html/badge?style=flat-square
[dependencyci-url]: https://dependencyci.com/github/christophehurpeau/error-html
