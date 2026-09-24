import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const nested = path.resolve(
  "apps/mobile-app/node_modules/react-native-drawer-layout"
);

if (!fs.existsSync(nested)) {
  process.exit(0);
}

const marker = path.join(
  nested,
  "lib/module/views/InteractionManager.js"
);
if (
  fs.existsSync(marker) &&
  fs.readFileSync(marker, "utf8").includes("const InteractionManager = undefined")
) {
  process.exit(0);
}

const source = fs.readFileSync(
  "patches/react-native-drawer-layout+4.2.10.patch",
  "utf8"
);
const rewritten = source.replaceAll(
  "node_modules/react-native-drawer-layout/",
  ""
);
const file = path.join(os.tmpdir(), "kindred-drawer-layout.patch");
fs.writeFileSync(file, rewritten);

const asText = (value) => {
  if (value == null) {
    return "";
  }
  return Buffer.isBuffer(value) ? value.toString("utf8") : String(value);
};

try {
  // Do not use --silent: GNU patch on Linux CI hides "already applied" text,
  // and the catch below would treat a no-op as a hard failure (Vercel web).
  execFileSync(
    "patch",
    ["-p1", "--forward", `--directory=${nested}`, "-i", file],
    { stdio: ["ignore", "pipe", "pipe"] }
  );
} catch (error) {
  const output = `${asText(error.stdout)}${asText(error.stderr)}`;
  if (/previously applied|Ignoring|Reversed/i.test(output)) {
    process.exit(0);
  }
  process.stderr.write(output || asText(error.message));
  process.exit(error.status ?? 1);
}
