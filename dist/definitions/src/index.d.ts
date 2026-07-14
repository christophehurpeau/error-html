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
interface Renderer {
    openLocalFile: (filePath: string, lineNumber: number | null | undefined, columnNumber: number | null | undefined) => string;
    replaceAppInFilePath: (filePath: string | undefined) => string;
    render: (error: ErrorLike) => string;
    renderStack: (error: ErrorLike) => string;
    highlightLine: (contents: string, lineNumber: number | null | undefined, language?: string) => string;
    lines: (withLineNumbers: boolean, startNumber: number, lines: string[]) => string;
    line: (withLineNumbers: boolean, lineNumber: number, attributes: Record<string, string>, contentLine: string) => string;
}
export declare function createErrorHtmlRenderer(options?: RendererOptions): Renderer;
export {};
//# sourceMappingURL=index.d.ts.map