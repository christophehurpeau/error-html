import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import { createErrorHtmlRenderer } from "../src/index.ts";
import { buildSampleError } from "./sample-error.ts";

const screenshotPath = fileURLToPath(
  new URL("../readme/screenshot.png", import.meta.url),
);

const wrapDocument = (body: string): string =>
  `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      body {
        margin: 0;
        padding: 24px;
        background: #fff;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      }
      #error {
        max-width: 900px;
      }
    </style>
  </head>
  <body>
    <div id="error">${body}</div>
  </body>
</html>`;

test("renders the error stack with an expanded source frame", async ({
  page,
}) => {
  const renderer = createErrorHtmlRenderer({ appPath: process.cwd() });
  const html = renderer.render(buildSampleError());

  await page.setContent(wrapDocument(html));

  const container = page.locator("#error");
  await expect(container.locator("h1")).toHaveText("TypeError");
  await expect(container).toContainText("computeTotalQuantity");
  await expect(container).toContainText("File content :");

  await container.screenshot({ path: screenshotPath });
});
