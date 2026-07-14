import path from "node:path";
import { htmlEscape } from "escape-goat";
import hljs from "highlight.js/lib/core";
import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import parseErrorStack from "./parseErrorStack.ts";

hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("typescript", typescript);

interface RendererOptions {
  fileProtocol?: string;
  appPath?: string;
  production?: boolean;
}

type ErrorLike = Error & {
  name?: string;
  message?: string;
  stack?: string;
};

interface StackFrame {
  fileName?: string;
  lineNumber?: number | null;
  columnNumber?: number | null;
  isNative?: boolean;
  isEval?: boolean;
  functionName?: string;
  typeName?: string;
  methodName?: string;
  file?:
    | false
    | {
        contents?: string;
      };
}

interface Renderer {
  openLocalFile: (
    filePath: string,
    lineNumber: number | null | undefined,
    columnNumber: number | null | undefined,
  ) => string;
  replaceAppInFilePath: (filePath: string | undefined) => string;
  render: (error: ErrorLike) => string;
  renderStack: (error: ErrorLike) => string;
  highlightLine: (
    contents: string,
    lineNumber: number | null | undefined,
    language?: string,
  ) => string;
  lines: (
    withLineNumbers: boolean,
    startNumber: number,
    lines: string[],
  ) => string;
  line: (
    withLineNumbers: boolean,
    lineNumber: number,
    attributes: Record<string, string>,
    contentLine: string,
  ) => string;
}

function toAttributeValue(value: unknown): string {
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return String(value);
  }

  return JSON.stringify(value) || "";
}

function tag({
  tagName,
  attributes,
  content,
  contentEscape,
}: {
  tagName: string;
  attributes?: Record<string, unknown> | null;
  content?: string | null;
  contentEscape?: boolean | null;
}): string {
  const attrs = attributes || {};
  let str = "";
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === false || value == null) {
      return;
    }

    str += ` ${key}`;
    if (value === true) {
      str += `="${key}"`;
    } else {
      str += `="${htmlEscape(toAttributeValue(value))}"`;
    }
  });

  return `<${tagName}${str}${
    content == null
      ? "/"
      : `>${contentEscape ? htmlEscape(content) : content}</${tagName}`
  }>`;
}

function languageFromFileName(fileName: string | undefined): string {
  return fileName && /\.[cm]?tsx?(?:$|\?)/.test(fileName)
    ? "typescript"
    : "javascript";
}

function renderFrame(
  frame: StackFrame,
  index: number,
  renderer: Renderer,
): string {
  let str = "";
  if (frame.file && frame.file.contents) {
    str +=
      '<span><a href="javascript:;" style="color:#CC7A00;text-decoration:none;outline:none;cursor:pointer" ' +
      "onclick=\"var el=this.parentNode.nextElementSibling; el.style.display=el.style.display=='none'?'block':'none';\">";
  }

  str += `#${index} `;
  if (!frame.isNative && !frame.isEval) {
    let fileName = frame.fileName || "";
    if (fileName.startsWith("file://")) {
      fileName = fileName.slice("file://".length);
    }

    if (fileName.startsWith("/")) {
      str += renderer.openLocalFile(
        fileName,
        frame.lineNumber,
        frame.columnNumber,
      );
    }

    str += renderer.replaceAppInFilePath(fileName);

    const locationParts: string[] = [];
    if (frame.lineNumber !== null && frame.lineNumber !== undefined) {
      locationParts.push(String(frame.lineNumber));
    }
    if (frame.columnNumber !== null && frame.columnNumber !== undefined) {
      locationParts.push(String(frame.columnNumber));
    }
    if (locationParts.length > 0) {
      str += `:${locationParts.join(":")}`;
    }

    if (fileName.startsWith("/")) {
      str += "</a>";
    }

    str += " ";
  }

  if (frame.functionName) {
    str += frame.functionName;
  } else if (frame.typeName) {
    str += `${frame.typeName}.${frame.methodName || "<anonymous>"}`;
  }

  if (frame.isNative) {
    str += " [native]";
  }

  if (frame.isEval) {
    str += " [eval]";
  }

  if (frame.file && frame.file.contents) {
    str += "</a></span>";
    str += `<div style="display:${index === 0 ? "block" : "none"}">`;

    str += '<div style="margin-top: 5px">';
    str += "<b>File content :</b><br />";
    str += renderer.highlightLine(
      frame.file.contents,
      frame.lineNumber,
      languageFromFileName(frame.fileName),
    );
    str += "</div>";

    str += "</div>";
  }

  str += "\n";
  return str;
}

export function createErrorHtmlRenderer(
  options: RendererOptions = {},
): Renderer {
  const fileProtocol = options.fileProtocol || "file";

  return {
    /**
     * @ignore
     */
    openLocalFile(
      filePath: string,
      lineNumber: number | null | undefined,
      columnNumber: number | null | undefined,
    ) {
      return (
        `<a download href="${fileProtocol}://${htmlEscape(filePath)}` +
        `${
          !lineNumber
            ? ""
            : `?${lineNumber}${!columnNumber ? "" : `:${columnNumber}`}`
        }">`
      );
    },

    /**
     * @ignore
     */
    replaceAppInFilePath(filePath: string | undefined) {
      if (!filePath) return "unknown";

      if (options.appPath) {
        if (filePath.startsWith(options.appPath)) {
          filePath = `APP/${filePath.slice(options.appPath.length).replace(/^\//, "")}`;
        } else {
          const relativeToAppPath = path.relative(
            options.appPath || "",
            filePath,
          );
          if (filePath.startsWith(relativeToAppPath)) {
            const relativeFilePath = `APP/${filePath.slice(relativeToAppPath.length).replace(/^\//, "")}`;
            if (relativeFilePath.length < filePath.length) {
              filePath = relativeFilePath;
            }
          }
        }
      }

      return filePath;
    },

    /**
     * @param {Error} error
     */
    render(error: ErrorLike) {
      let str = '<div style="text-align: left">';
      str += `<h1 style="background:#FFF;color:#E07308;border:0;font-size:4em;margin:16px 0 8px;padding:4px 2px;">${error.name}</h1>\n`;
      if (error.message) {
        str +=
          '<pre style="background:#FFF;color:#222;border:0;font-size:1em;margin:5px 0 0;padding: 0 4px;white-space:pre-wrap;word-wrap:break-word">';
        str += htmlEscape(error.message);
        str += "</pre>";
      }

      if (!options.production) {
        str +=
          '<h5 style="background:#FFDDAA;color:#333;border:1px solid #E07308;margin:16px 0 8px;padding:4px 2px;">Stack:</h5>\n';
        str += `<pre style="background:#FFF;color:#222;border:0;margin:0;padding:0 4px">${this.renderStack(
          error,
        )}</pre>`;
        str +=
          "<small><em>Click on the line number to display/hide the content file !</em></small>";

        str +=
          '<h5 style="background:#FFDDAA;color:#333;border:1px solid #E07308;margin:16px 0 8px;padding:4px 2px;">Source Stack:</h5>\n';
        str += `<pre style="background:#FFF;color:#222;border:0;margin:0;padding:0 4px">${htmlEscape(
          error.stack || "",
        )}</pre>`;
      }

      return str;
    },

    /**
     * @ignore
     */
    renderStack(error: ErrorLike) {
      const frames = parseErrorStack(error) as StackFrame[];

      let str = `<style>.hljs-string{ color: #E68A00; }
.hljs-subst{ color: #EEEEFF; }
.hljs-regexp{ color: #C365CA; }
.hljs-number{ color: #E6CF00; }
.hljs-literal{ color: #D34F4A; }
.hljs-keyword, .hljs-meta{ color: #D37947; }
.hljs-variable.language_{ font-weight: bold; color: #D37947; }
.hljs-built_in{ font-weight: bold; color: #88B8E2; }
.hljs-type{ color: #88B8E2; }
.hljs-title.class_{ font-weight: bold; color: #FEFEFE; }
.hljs-title.function_{ font-weight: bold; color: #B488E2; }
.hljs-title, .hljs-name{ color: #B5A726; }
.hljs-comment, .hljs-quote{ color: #707070; }
.hljs-doctag{ color: #6A8759; }
.hljs-attr, .hljs-attribute, .hljs-params, .hljs-variable, .hljs-property{ color: #EBEBEB; }
</style>`;
      frames.forEach((frame, index) => {
        str += renderFrame(frame, index, this);
      });

      return str;
    },

    /**
     * @ignore
     */
    highlightLine(
      contents: string,
      lineNumber: number | null | undefined,
      language = "javascript" /* , columnNumber */,
    ) {
      const style = "background:#D3794764;";
      const withLineNumbers = true;
      const minmax = 4;

      let hcontents: string[];
      try {
        hcontents = hljs
          .highlight(contents, { language })
          .value.split(/\r\n|\n\r|\n|\r/);
      } catch {
        hcontents = htmlEscape(contents).split(/\r\n|\n\r|\n|\r/);
      }

      const ok =
        lineNumber !== null &&
        lineNumber !== undefined &&
        lineNumber <= hcontents.length;
      let firstLine = 0;
      let start: string[] = hcontents;
      let lineContent = "";
      let end: string[] = [];

      if (ok) {
        firstLine = Math.max(0, lineNumber - 1 - minmax);
        start = hcontents.slice(firstLine, lineNumber - 1);
        lineContent = lineNumber === 0 ? "" : hcontents[lineNumber - 1] || "";
        end = hcontents.slice(lineNumber, lineNumber + minmax);
      }

      /* if (withLineNumbers) {
              // $withLineNumbers = '%'.strlen((string)($ok ? $line+$minmax : $minmax+1)).'d';
          } */

      let content = this.lines(withLineNumbers, ok ? firstLine + 1 : 1, start);
      if (ok) {
        const attributes = { style };
        content += this.line(
          withLineNumbers,
          lineNumber,
          attributes,
          lineContent,
        );
        content += this.lines(withLineNumbers, lineNumber + 1, end);
      }

      const preAttrs = {
        style:
          "background:#080808;color:#E0E0E0;border:0;padding:0;position:relative;",
      };
      return tag({
        tagName: "pre",
        attributes: preAttrs,
        content,
        contentEscape: false,
      });
    },

    /**
     * @ignore
     */
    lines(withLineNumbers: boolean, startNumber: number, _lines: string[]) {
      let content = "";
      _lines.forEach((line, index) => {
        content += this.line(withLineNumbers, startNumber + index, {}, line);
      });
      return content;
    },

    /**
     * @ignore
     */
    line(
      withLineNumbers: boolean,
      lineNumber: number,
      attributes: Record<string, string>,
      contentLine: string,
    ) {
      attributes.style = `${attributes.style || ""}white-space:pre-wrap;${
        withLineNumbers ? "padding-left:20px;" : ""
      }`;

      const isEmptyLine = contentLine === "";

      if (withLineNumbers) {
        contentLine =
          '<i style="color:#707070;font-size:7pt;position:absolute;left:1px;padding-top:1px;">' +
          `${lineNumber}</i>${contentLine}`;
      }

      if (isEmptyLine) {
        contentLine += "\n";
      }

      return tag({
        tagName: "div",
        attributes,
        content: contentLine,
        contentEscape: false,
      });
    },
  };
}
