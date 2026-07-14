import assert from "node:assert/strict";
import { unlinkSync, writeFileSync } from "node:fs";
import test from "node:test";
import { createErrorHtmlRenderer } from "./index.ts";

test("highlightLine uses modern highlight classes for JavaScript", () => {
  const renderer = createErrorHtmlRenderer();
  const result = renderer.highlightLine("const answer = 42;\n", 1);

  assert.match(result, /hljs-keyword/);
  assert.match(result, /hljs-number/);
});

test("highlightLine supports TypeScript syntax", () => {
  const renderer = createErrorHtmlRenderer();
  const result = renderer.highlightLine(
    "const value: string = 'ok';\n",
    1,
    "typescript",
  );

  assert.match(result, /hljs-keyword/);
  assert.match(result, /hljs-string/);
});

test("render includes the error header and stack section", () => {
  const renderer = createErrorHtmlRenderer();
  const error = new Error("boom");
  error.name = "ExampleError";

  const result = renderer.render(error);

  assert.match(result, /ExampleError/);
  assert.match(result, /Stack:/);
  assert.match(result, /Source Stack:/);
});

test("renderStack keeps local file links for stack frames", () => {
  const renderer = createErrorHtmlRenderer();
  const tempFilePath = "/tmp/error-html-test-example.js";
  writeFileSync(tempFilePath, "const answer = 42;\n");

  try {
    const error = new Error("boom");
    error.stack = `Error: boom\n    at test (file://${tempFilePath}:1:1)`;

    const result = renderer.renderStack(error);

    assert.match(result, /file:\/\/\/tmp\/error-html-test-example\.js/);
    assert.match(result, /File content :/);
  } finally {
    unlinkSync(tempFilePath);
  }
});

test("replaceAppInFilePath rewrites paths under the app root", () => {
  const renderer = createErrorHtmlRenderer({ appPath: "/Users/me/project" });

  assert.equal(
    renderer.replaceAppInFilePath("/Users/me/project/src/index.ts"),
    "APP/src/index.ts",
  );
});

test("replaceAppInFilePath leaves relative paths unchanged", () => {
  const renderer = createErrorHtmlRenderer({ appPath: "/Users/me/project" });

  assert.equal(
    renderer.replaceAppInFilePath("../../node_modules/pkg/index.js"),
    "../../node_modules/pkg/index.js",
  );
});

test("replaceAppInFilePath leaves paths outside the app root unchanged", () => {
  const renderer = createErrorHtmlRenderer({ appPath: "/Users/me/project" });

  assert.equal(
    renderer.replaceAppInFilePath("/tmp/example.js"),
    "/tmp/example.js",
  );
});

test("openLocalFile uses the custom file protocol", () => {
  const renderer = createErrorHtmlRenderer({ fileProtocol: "vscode" });

  assert.match(
    renderer.openLocalFile("/tmp/example.js", 1, 2),
    /href="vscode:\/\/\/tmp\/example\.js\?1:2"/,
  );
});

test("render omits stack sections in production mode", () => {
  const renderer = createErrorHtmlRenderer({ production: true });
  const error = new Error("boom");
  error.name = "ExampleError";

  const result = renderer.render(error);

  assert.match(result, /ExampleError/);
  assert.doesNotMatch(result, /Stack:/);
  assert.doesNotMatch(result, /Source Stack:/);
});
