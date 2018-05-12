declare module "error-html" {
  export interface Options {
    fileProtocol?: 'file';
  }

  export default class HtmlRenderer {
    constructor(options?: Options);
    render(error: Error): string;
  }
}
