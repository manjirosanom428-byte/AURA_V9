const fs = require("node:fs");
const vm = require("node:vm");

const html = fs.readFileSync("index.html", "utf8");
const scripts = [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/gi)]
  .map(match => match[1])
  .filter(source => source.trim());

if (scripts.length === 0) {
  throw new Error("No inline JavaScript blocks found in index.html");
}

scripts.forEach((source, index) => {
  new vm.Script(source, { filename: \`index.html:inline-script-\${index + 1}\` });
});

console.log(\`Checked \${scripts.length} inline JavaScript block(s) in index.html.\`);
