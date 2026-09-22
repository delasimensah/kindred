import { spawnSync } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const manifestPath = path.join(root, "seed/manifest.json");
const peaksPath = path.join(root, "seed/peaks.json");
const CHUNK = 10;

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

async function uploadFile(uploadUrl, filePath, contentType) {
  const body = await readFile(filePath);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": contentType },
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

function contentType(fileName) {
  if (fileName.endsWith(".mp3")) {
    return "audio/mpeg";
  }
  if (fileName.endsWith(".png")) {
    return "image/png";
  }
  return "image/jpeg";
}

function assetPath(entry) {
  const folder = entry.file.endsWith(".mp3") ? "audio" : "images";
  return path.join(root, "seed/assets", folder, entry.file);
}

async function main() {
  const password = process.env.SEED_PASSWORD ?? "";
  if (password.length < 8) {
    throw new Error(
      "Set SEED_PASSWORD to at least 8 characters. It is not stored in git."
    );
  }
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const peaksByFile = JSON.parse(await readFile(peaksPath, "utf8"));
  const entries = [...manifest.audio, ...manifest.images];
  convexRun("seedCatalog:upsertArtists", {});
  const stored = convexRun("seedCatalog:storedAssets", {});
  const storedIds = new Map(
    stored.map((file) => [file.sourceUrl, file.storageId])
  );
  const missing = [];
  for (const entry of entries) {
    if (!storedIds.has(entry.sourceUrl)) {
      missing.push(entry);
    }
  }
  for (let offset = 0; offset < missing.length; offset += 20) {
    const batch = missing.slice(offset, offset + 20);
    const urls = convexRun("seedCatalog:generateUploadUrls", {
      count: batch.length,
    });
    for (const [index, entry] of batch.entries()) {
      const storageId = await uploadFile(
        urls[index],
        assetPath(entry),
        contentType(entry.file)
      );
      storedIds.set(entry.sourceUrl, storageId);
      console.log(`Uploaded ${entry.file}`);
    }
  }
  const files = [];
  for (const entry of entries) {
    const storageId = storedIds.get(entry.sourceUrl);
    const fileStat = await stat(assetPath(entry));
    files.push({
      sourceUrl: entry.sourceUrl,
      storageId,
      contentType: contentType(entry.file),
      sizeBytes: fileStat.size,
      credit: entry.credit,
      kind: entry.file.endsWith(".mp3") ? "trackAudio" : entry.kind,
      ...(entry.artistHandle === undefined
        ? {}
        : { artistHandle: entry.artistHandle }),
    });
  }
  const registered = convexRun("seedCatalog:registerFiles", { files });
  console.log(
    `Files registered ${registered.registered}, reused ${registered.reused}.`
  );

  const audioSourceUrls = manifest.audio.map((entry) => entry.sourceUrl);
  const artworkSourceUrls = manifest.images
    .filter((entry) => entry.kind === "artwork")
    .sort((left, right) => left.index - right.index)
    .map((entry) => entry.sourceUrl);
  if (audioSourceUrls.length !== 40 || artworkSourceUrls.length !== 36) {
    throw new Error("Manifest must list 40 audio files and 36 artworks.");
  }
  for (let start = 0; start < 500; start += CHUNK) {
    const peaks = [];
    const durationMs = [];
    for (let index = start; index < start + CHUNK && index < 500; index += 1) {
      const audio = manifest.audio[index % manifest.audio.length];
      const row = peaksByFile[audio.file];
      peaks.push(row.peaks);
      durationMs.push(row.durationMs);
    }
    const result = convexRun("seedCatalog:insertTrackChunk", {
      start,
      audioSourceUrls,
      artworkSourceUrls,
      peaks,
      durationMs,
    });
    console.log(
      `Tracks ${start}: inserted ${result.inserted}, skipped ${result.skipped}.`
    );
  }

  const accounts = convexRun("seedCatalog:ensureAccounts", { password });
  console.log(
    `Accounts created ${accounts.created}, already there ${accounts.existing}, profiles ${accounts.profiles}.`
  );
  console.log(
    "Demo logins: akosua.frimpong@kindred.example, efua.boateng@kindred.example, amaara.mensah@kindred.example, delasi.mensah@kindred.example."
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
