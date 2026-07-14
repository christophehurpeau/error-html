<h1 align="center">
  error-html
</h1>

<p align="center">
  render error stack in html
</p>

<p align="center">
  <a href="https://npmjs.org/package/error-html"><img src="https://img.shields.io/npm/v/error-html.svg?style=flat-square" alt="npm version"></a>
  <a href="https://npmjs.org/package/error-html"><img src="https://img.shields.io/npm/dw/error-html.svg?style=flat-square" alt="npm downloads"></a>
  <a href="https://npmjs.org/package/error-html"><img src="https://img.shields.io/node/v/error-html.svg?style=flat-square" alt="node version"></a>
  <a href="https://npmjs.org/package/error-html"><img src="https://img.shields.io/npm/types/error-html.svg?style=flat-square" alt="types"></a>
  <a href="https://codecov.io/gh/christophehurpeau/error-html"><img src="https://img.shields.io/codecov/c/github/christophehurpeau/error-html/main.svg?style=flat-square"></a>
  <a href="https://christophehurpeau.github.io/error-html/"><img src="https://img.shields.io/website.svg?down_color=lightgrey&down_message=offline&up_color=blue&up_message=online&url=https%3A%2F%2Fchristophehurpeau.github.io%2Ferror-html%2F?style=flat-square"></a>
</p>

## Install

```bash
npm install --save error-html
```

## Screenshot

![screenshot](readme/screenshot.png?raw=true)

This screenshot is generated and kept up to date by the Playwright test in [e2e/](e2e/). Run `pnpm run test:e2e` to regenerate it.

## Related

- [react-error-html](https://npmjs.org/package/react-error-html)

## Usage

```js
import { createErrorHtmlRenderer } from "error-html";

const errorHtmlRenderer = createErrorHtmlRenderer({
  appPath: process.cwd(),
});

console.log(errorHtmlRenderer.render(new Error()));
```
