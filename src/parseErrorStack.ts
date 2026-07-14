import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseStackTrace } from "errorstacks";

interface ParsedFile {
  fileName?: string;
  contents?: string;
}

interface ParsedFrame {
  fileName?: string;
  lineNumber?: number | null;
  columnNumber?: number | null;
  isNative?: boolean;
  isEval?: boolean;
  functionName?: string;
  file?: ParsedFile | false;
}

const normalizePosition = (value: number): number | null =>
  value >= 0 ? value : null;

const toLocalPath = (fileName: string): string | undefined => {
  if (fileName.startsWith("file://")) {
    try {
      return fileURLToPath(fileName);
    } catch {
      return undefined;
    }
  }
  return fileName.startsWith("/") ? fileName : undefined;
};

const readFile = (
  fileName: string,
  cache: Map<string, ParsedFile | false>,
): ParsedFile | false => {
  const cached = cache.get(fileName);
  if (cached !== undefined) return cached;

  try {
    const file: ParsedFile = {
      fileName,
      contents: readFileSync(fileName).toString(),
    };
    cache.set(fileName, file);
    return file;
  } catch {
    cache.set(fileName, false);
    return false;
  }
};

const parseErrorStack = (err: Error): ParsedFrame[] => {
  const cache = new Map<string, ParsedFile | false>();

  return parseStackTrace(err.stack).map((frame): ParsedFrame => {
    const isNative = frame.type === "native";
    const isEval = frame.raw.includes("eval at ");
    const fileName = frame.fileName || undefined;

    const parsed: ParsedFrame = {
      fileName,
      lineNumber: normalizePosition(frame.line),
      columnNumber: normalizePosition(frame.column),
      isNative,
      isEval,
      functionName: frame.name || undefined,
    };

    if (!isNative && !isEval && fileName) {
      const localPath = toLocalPath(fileName);
      if (localPath) parsed.file = readFile(localPath, cache);
    }

    return parsed;
  });
};

export default parseErrorStack;
