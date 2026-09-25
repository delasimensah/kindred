import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { readFile, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Re-encode the forty seed MP3s to short clips so Free-plan file egress lasts.
 * Same Kevin MacLeod sources and filenames. Regenerates peaks + manifest durations.
 *
 * Target: ~75s at 96 kbps → unique audio well under ~50 MB.
 */

const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const audioDir = path.join(root, "seed/assets/audio");
const manifestPath = path.join(root, "seed/manifest.json");
const peaksPath = path.join(root, "seed/peaks.json");

const CLIP_SECONDS = 75;
const BITRATE = "96k";
const PEAK_BUCKETS = 1000;

function runFfmpeg(args) {
  const result = spawnSync(ffmpeg, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || `ffmpeg failed: ${args.join(" ")}`);
  }
}

function durationSeconds(filePath) {
  const result = spawnSync(
    ffmpeg,
    ["-hide_banner", "-i", filePath, "-f", "null", "-"],
    { encoding: "utf8" }
  );
  const match = result.stderr.match(/Duration:\s+(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (match === null) {
    throw new Error(`No duration for ${filePath}`);
  }
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function decodePeaks(filePath) {
  const result = spawnSync(
    ffmpeg,
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      filePath,
      "-ac",
      "1",
      "-ar",
      "8000",
      "-f",
      "f32le",
      "pipe:1",
    ],
    { maxBuffer: 64 * 1024 * 1024 }
  );
  if (result.status !== 0) {
    throw new Error(result.stderr?.toString() || `decode failed ${filePath}`);
  }
  const bytes = result.stdout;
  const copy = Buffer.from(bytes);
  const samples = new Float32Array(
    copy.buffer,
    copy.byteOffset,
    Math.floor(copy.byteLength / 4)
  );
  const peaks = new Array(PEAK_BUCKETS).fill(0);
  if (samples.length === 0) {
    return peaks;
  }
  const bucketSize = samples.length / PEAK_BUCKETS;
  for (let index = 0; index < PEAK_BUCKETS; index += 1) {
    const start = Math.floor(index * bucketSize);
    const end = Math.floor((index + 1) * bucketSize);
    let peak = 0;
    for (let sample = start; sample < end; sample += 1) {
      const value = Math.abs(samples[sample] ?? 0);
      if (value > peak) {
        peak = value;
      }
    }
    peaks[index] = peak;
  }
  const max = Math.max(...peaks);
  if (max === 0) {
    return peaks;
  }
  return peaks.map((peak) => Math.round((peak / max) * 1000) / 1000);
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (!Array.isArray(manifest.audio) || manifest.audio.length !== 40) {
    throw new Error("manifest.json must list 40 audio files");
  }

  const peaks = {};
  let totalBytes = 0;

  for (const entry of manifest.audio) {
    const filePath = path.join(audioDir, entry.file);
    await stat(filePath);
    const tempPath = `${filePath}.shrunk.mp3`;
    runFfmpeg([
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      filePath,
      "-t",
      String(CLIP_SECONDS),
      "-map",
      "0:a:0",
      "-vn",
      "-map_metadata",
      "-1",
      "-codec:a",
      "libmp3lame",
      "-b:a",
      BITRATE,
      tempPath,
    ]);
    await unlink(filePath);
    await rename(tempPath, filePath);
    const seconds = durationSeconds(filePath);
    const durationMs = Math.round(seconds * 1000);
    peaks[entry.file] = {
      durationMs,
      peaks: decodePeaks(filePath),
    };
    entry.durationMs = durationMs;
    const fileStat = await stat(filePath);
    totalBytes += fileStat.size;
    console.log(
      `Shrunk ${entry.file} → ${seconds.toFixed(1)}s, ${(fileStat.size / 1024 / 1024).toFixed(2)} MB`
    );
  }

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await writeFile(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`);
  console.log(
    `Unique audio ${(totalBytes / 1024 / 1024).toFixed(1)} MB (target under ~50 MB).`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
