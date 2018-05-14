declare module "error-html" {
  export interface Options {
    fileProtocol?: 'file';
    production?: boolean;
    appPath?: string;
  }

  export default class HtmlRenderer {
    constructor(options?: Options);
    render(error: Error): string;
  }
}
