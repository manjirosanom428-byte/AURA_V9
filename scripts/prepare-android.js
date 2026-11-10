const fs = require("node:fs");
const path = require("node:path");

const root = process.cwd();
const webDir = path.join(root, "www");
const backendUrl = String(process.env.AURA_API_URL || "").trim().replace(/\/+$/, "");

if (!backendUrl || !/^https:\/\//i.test(backendUrl)) {
  throw new Error("Set AURA_API_URL to the HTTPS URL of the deployed AURA V9 backend.");
}

fs.rmSync(webDir, { recursive: true, force: true });
fs.mkdirSync(webDir, { recursive: true });

for (const file of ["index.html", "login.html", "intro.html", "aura-icon.svg", "aura.webmanifest", "service-worker.js"]) {
  fs.copyFileSync(path.join(root, file), path.join(webDir, file));
}

const config = `(function () {
  const apiBase = ${JSON.stringify(backendUrl)};
  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    let url = typeof input === "string" ? input : (input instanceof URL ? input.href : input.url);
    if (typeof url === "string" && /^\\/api(?:\\/|$)/.test(url)) {
      const target = apiBase + url;
      input = input instanceof Request ? new Request(target, input) : target;
    }
    return originalFetch(input, init);
  };
})();\n`;

fs.writeFileSync(path.join(webDir, "aura-config.js"), config, "utf8");

for (const file of ["index.html", "login.html", "intro.html"]) {
  const target = path.join(webDir, file);
  let html = fs.readFileSync(target, "utf8");
  if (!html.includes("aura-config.js")) {
    html = html.replace("</head>", '  <script src="./aura-config.js"></script>\\n</head>');
  }
  fs.writeFileSync(target, html, "utf8");
}

const manifestPath = path.join(webDir, "aura.webmanifest");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.start_url = "./intro.html";
manifest.scope = "./";
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\\n");

console.log("Prepared local AURA V9 web assets for Android. API endpoint:", backendUrl);
