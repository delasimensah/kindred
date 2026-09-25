import fs from "node:fs";
import path from "node:path";

/**
 * Yarn nohoist keeps a second copy under apps/mobile-app/node_modules.
 * patch-package only patches the workspace root copy. This script fixes the
 * nested copy the same way — with plain Node writes (no system `patch` binary).
 *
 * Skip on Vercel: web does not use this package. Yarn still installs the
 * mobile workspace, and a nested mobile patch must not break the web build.
 */
if (process.env.VERCEL) {
  process.exit(0);
}

const nested = path.resolve(
  "apps/mobile-app/node_modules/react-native-drawer-layout"
);

if (!fs.existsSync(nested)) {
  process.exit(0);
}

const jsBody = `"use strict";

const InteractionManager = undefined;
export { InteractionManager };
`;

const tsBody = `/**
 * Reading InteractionManager from react-native warns on React Native 0.86.
 * The drawer only used it to delay work, and that call is already skipped
 * on 0.82 and newer.
 */
const InteractionManager = undefined;

export { InteractionManager };
`;

const files = [
  ["lib/module/views/InteractionManager.js", jsBody],
  ["lib/module/views/InteractionManager.native.js", jsBody],
  ["src/views/InteractionManager.tsx", tsBody],
  ["src/views/InteractionManager.native.tsx", tsBody],
];

for (const [relative, body] of files) {
  const target = path.join(nested, relative);
  if (!fs.existsSync(target)) {
    continue;
  }
  fs.writeFileSync(target, body);
}
