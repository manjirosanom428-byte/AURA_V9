const fs = require("node:fs");
const path = require("node:path");
const sharp = require("sharp");

async function main() {
  const root = process.cwd();
  const source = path.join(root, "aura-icon.svg");
  const res = path.join(root, "android", "app", "src", "main", "res");
  if (!fs.existsSync(source) || !fs.existsSync(res)) {
    throw new Error("AURA icon source or generated Android resources directory is missing.");
  }

  const legacy = { mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  const adaptive = { mdpi: 108, hdpi: 162, xhdpi: 216, xxhdpi: 324, xxxhdpi: 432 };

  for (const [density, size] of Object.entries(legacy)) {
    const dir = path.join(res, "mipmap-" + density);
    fs.mkdirSync(dir, { recursive: true });
    await sharp(source).resize(size, size, { fit: "contain" }).png().toFile(path.join(dir, "ic_launcher.png"));
    await sharp(source).resize(size, size, { fit: "contain" }).png().toFile(path.join(dir, "ic_launcher_round.png"));
  }

  for (const [density, size] of Object.entries(adaptive)) {
    const dir = path.join(res, "mipmap-" + density);
    fs.mkdirSync(dir, { recursive: true });
    await sharp(source).resize(size, size, { fit: "contain" }).png().toFile(path.join(dir, "ic_launcher_foreground.png"));
  }

  const adaptiveDir = path.join(res, "mipmap-anydpi-v26");
  fs.mkdirSync(adaptiveDir, { recursive: true });
  const xml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/aura_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;
  fs.writeFileSync(path.join(adaptiveDir, "ic_launcher.xml"), xml);
  fs.writeFileSync(path.join(adaptiveDir, "ic_launcher_round.xml"), xml);
  const valuesDir = path.join(res, "values");
  fs.mkdirSync(valuesDir, { recursive: true });
  fs.writeFileSync(path.join(valuesDir, "aura_launcher_colors.xml"), `<?xml version="1.0" encoding="utf-8"?>
<resources><color name="aura_launcher_background">#080B1B</color></resources>
`);
  console.log("Generated AURA V9 launcher icons for all Android densities.");
}

main().catch(error => { console.error(error); process.exit(1); });
