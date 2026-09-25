import { spawnSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Upload shrunk seed MP3s and patch Convex files + tracks.
 * Run after `yarn seed:shrink` (local assets). Requires Convex pushed.
 */

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const manifestPath = path.join(root, "seed/manifest.json");
const peaksPath = path.join(root, "seed/peaks.json");
const BATCH = 5;

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
  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error(`${functionName} did not return JSON\n${text}`);
    }
    return JSON.parse(text.slice(start, end + 1));
  }
}

async function uploadFile(uploadUrl, filePath) {
  const body = await readFile(filePath);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "audio/mpeg" },
    body,
  });
  if (!response.ok) {
    throw new Error(`Upload failed ${response.status} for ${filePath}`);
  }
  const payload = await response.json();
  if (typeof payload.storageId !== "string") {
    throw new Error(`Upload did not return a storage id for ${filePath}`);
  }
  return payload.storageId;
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const peaksByFile = JSON.parse(await readFile(peaksPath, "utf8"));
  if (!Array.isArray(manifest.audio) || manifest.audio.length !== 40) {
    throw new Error("manifest.json must list 40 audio files");
  }

  let filesReplaced = 0;
  let tracksPatched = 0;
  let missing = 0;

  for (let offset = 0; offset < manifest.audio.length; offset += BATCH) {
    const batch = manifest.audio.slice(offset, offset + BATCH);
    const urls = convexRun("seedCatalog:generateUploadUrls", {
      count: batch.length,
    });
    const files = [];
    for (const [index, entry] of batch.entries()) {
      const filePath = path.join(root, "seed/assets/audio", entry.file);
      const fileStat = await stat(filePath);
      const peakRow = peaksByFile[entry.file];
      if (peakRow === undefined) {
        throw new Error(`Missing peaks for ${entry.file}`);
      }
      const storageId = await uploadFile(urls[index], filePath);
      files.push({
        sourceUrl: entry.sourceUrl,
        storageId,
        sizeBytes: fileStat.size,
        credit: entry.credit,
        durationMs: peakRow.durationMs,
        peaks: peakRow.peaks,
      });
      console.log(`Uploaded ${entry.file}`);
    }
    const result = convexRun("seedCatalog:replaceSeedAudio", { files });
    filesReplaced += result.filesReplaced;
    tracksPatched += result.tracksPatched;
    missing += result.missing;
  }

  console.log(
    `Audio files replaced ${filesReplaced}, tracks patched ${tracksPatched}, missing ${missing}.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
