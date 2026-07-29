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
declare const parseErrorStack: (err: Error) => ParsedFrame[];
export default parseErrorStack;
//# sourceMappingURL=parseErrorStack.d.ts.map