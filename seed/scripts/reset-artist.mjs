import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);

function convexRun(functionName, args) {
  const result = spawnSync(
    "npx",
    [
      "convex",
      "run",
      functionName,
      JSON.stringify(args),
      "--codegen",
      "disable",
      "--typecheck",
      "disable",
    ],
    { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
  );
  if (result.status !== 0) {
    throw new Error(
      `${functionName} failed\n${result.stdout ?? ""}\n${result.stderr ?? ""}`
    );
  }
  const text = result.stdout.trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  return JSON.parse(text.slice(start, end + 1));
}

async function main() {
  const handle = process.argv[2];
  if (handle === undefined) {
    throw new Error("Usage: yarn seed:reset-artist <handle>");
  }
  const manifest = JSON.parse(
    await readFile(path.join(root, "seed/manifest.json"), "utf8")
  );
  const image = (kind) =>
    manifest.images.find(
      (entry) => entry.kind === kind && entry.artistHandle === handle
    );
  const avatar = image("avatar");
  const cover = image("cover");
  if (avatar === undefined || cover === undefined) {
    throw new Error(`${handle} is not a seed artist`);
  }
  const artworkSourceUrls = manifest.images
    .filter((entry) => entry.kind === "artwork")
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.sourceUrl);
  const reset = convexRun("seedReset:resetArtist", {
    handle,
    artworkSourceUrls,
    avatarSourceUrl: avatar.sourceUrl,
    coverSourceUrl: cover.sourceUrl,
  });
  console.log(
    `${handle}: restored ${reset.tracksRestored} tracks, deleted ${reset.tracksDeleted} tracks, ${reset.releasesDeleted} releases, ${reset.postsDeleted} posts.`
  );
  const releases = convexRun("seedCatalog:attachSeedReleases", {});
  console.log(
    `Seed releases: EP ${releases.ep ? "ready" : "skipped"}, album ${releases.album ? "ready" : "skipped"}.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
