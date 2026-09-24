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

try {
  execFileSync(
    "patch",
    ["-p1", "--forward", "--silent", `--directory=${nested}`, "-i", file],
    { stdio: "pipe" }
  );
} catch (error) {
  const output = `${error.stdout ?? ""}${error.stderr ?? ""}`;
  if (!/previously applied|Ignoring|Reversed/i.test(output)) {
    process.stderr.write(output);
    process.exit(error.status ?? 1);
  }
}
