import { writeFileSync } from "node:fs";
import path from "node:path";
import { createErrorHtmlRenderer } from "../src/index.ts";

const sample = `import { readFile } from "node:fs/promises";

// Springbok dark - syntax color sample
const pattern = /^\\d{3}-[a-z]+$/i;

interface User {
  id: number;
  name: string;
  active: boolean;
}

type Handler = (user: User) => Promise<number>;

class Repository extends Base {
  private cache = new Map<string, User>();

  async find(id: number): Promise<User | undefined> {
    const cached = this.cache.get(String(id));
    if (cached) return cached;
    const raw = await readFile(\`/data/\${id}.json\`, "utf8");
    const user: User = { id, name: "anon", active: true };
    return user;
  }
}

const inc = (x: number): number => x + 1;
const items = [1, 2, 3].map((v) => v * inc(v));
console.log(items, null, undefined, pattern, Handler);


const computeTotalQuantity = (order: Order): number => {
  return order.items.reduce((total, item) => total + item.quantity, 0);
};
`;

function extractHljsStyle(
  renderer: ReturnType<typeof createErrorHtmlRenderer>,
): string {
  const stack = renderer.renderStack({ name: "", message: "", stack: "" });
  return stack.slice(0, stack.indexOf("</style>") + "</style>".length);
}

function buildPage(): string {
  const renderer = createErrorHtmlRenderer();
  const style = extractHljsStyle(renderer);
  const fullFile = renderer.highlightLine(sample, null, "typescript");
  const withErrorLine = renderer.highlightLine(sample, 21, "typescript");

  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><title>error-html syntax preview</title></head>
<body style="margin:0;padding:24px;background:#080808;font-family:sans-serif">
${style}
<h2 style="color:#e0e0e0">Full snippet</h2>
${fullFile}
<h2 style="color:#e0e0e0;margin-top:32px">Error-line highlight (line 21)</h2>
${withErrorLine}
</body>
</html>`;
}

const outputPath = path.join(process.cwd(), "syntax-preview.html");
writeFileSync(outputPath, buildPage());
process.stdout.write(`Preview written to ${outputPath}\n`);
