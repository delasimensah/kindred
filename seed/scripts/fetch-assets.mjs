import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const ffmpeg = require("ffmpeg-static");
const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const audioDir = path.join(root, "seed/assets/audio");
const imageDir = path.join(root, "seed/assets/images");
const manifestPath = path.join(root, "seed/manifest.json");
const peaksPath = path.join(root, "seed/peaks.json");
const tmpDir = path.join(root, "seed/.tmp");

const MIN_SECONDS = 170;
const MAX_SECONDS = 250;
const CLIP_SECONDS = 75;
const AUDIO_BITRATE = "96k";
const AUDIO_COUNT = 40;
const PEAK_BUCKETS = 1000;

const CANDIDATES = [
  "Carefree",
  "Dreamer",
  "Rocket",
  "Voltaic",
  "Windswept",
  "Ice Flow",
  "Mighty Like Us",
  "New Friendly",
  "Early Riser",
  "Digital Lemonade",
  "Getting it Done",
  "Killing Time",
  "Overworld",
  "Pamgaea",
  "Reformat",
  "Rhinoceros",
  "ZigZag",
  "Autumn Day",
  "Chillin Hard",
  "Disquiet",
  "Immersed",
  "Wounded",
  "Cut and Dry",
  "Dance Monster",
  "Deliberate Thought",
  "Enter the Party",
  "Exit the Premises",
  "Furious Freak",
  "Go Cart",
  "Griphop",
  "How it Begins",
  "Laserpack",
  "Level Up",
  "One Sly Move",
  "Spellbound",
  "The Way Out",
  "Voice Over Under",
  "Bit Quest",
  "Blipotron",
  "Chipper Doodle",
  "Doobly Doo",
  "Show Your Moves",
  "Miami Viceroy",
  "Montauk Point",
  "Wallpaper",
  "Dream Culture",
  "Brittle Rille",
  "Inspired",
];

const PORTRAITS = [
  {
    handle: "amaara",
    photographer: "Prince Akachi",
    page: "https://unsplash.com/photos/portrait-photography-of-woman-RcqKOjX0ZHE",
    fetchUrl:
      "https://images.unsplash.com/photo-1531300185372-b7cbe2eddf0b?w=800&h=800&fit=crop&crop=faces&q=75&fm=jpg",
  },
  {
    handle: "kweku-darko",
    photographer: "Prince Akachi",
    page: "https://unsplash.com/photos/shallow-focus-photo-of-man-A07yNZW0iyk",
    fetchUrl:
      "https://images.unsplash.com/photo-1533108165347-036ec233d7ec?w=800&h=800&fit=crop&crop=faces&q=75&fm=jpg",
  },
  {
    handle: "sela-okoro",
    photographer: "Ayo Ogunseinde",
    page: "https://unsplash.com/photos/woman-wearing-black-shirt-sibVwORYqs0",
    fetchUrl:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800&h=800&fit=crop&crop=faces&q=75&fm=jpg",
  },
  {
    handle: "tewa-nkrumah",
    photographer: "Ayo Ogunseinde",
    page: "https://unsplash.com/photos/woman-wearing-white-shirt-standing-RrD8ypt8cjY",
    fetchUrl:
      "https://images.unsplash.com/photo-1500336624523-d727130c3328?w=800&h=800&fit=crop&crop=faces&q=75&fm=jpg",
  },
  {
    handle: "leye-ade",
    photographer: "Ayo Ogunseinde",
    page: "https://unsplash.com/photos/black-haired-man-making-face-sibVwORYqs0",
    fetchUrl:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=800&h=800&fit=crop&crop=faces&q=75&fm=jpg",
  },
];

function slug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function sourceUrlFor(title) {
  return `https://incompetech.com/music/royalty-free/mp3-royaltyfree/${encodeURIComponent(title)}.mp3`;
}

function creditFor(title) {
  return `${title} by Kevin MacLeod (incompetech.com) — CC BY 4.0 — https://creativecommons.org/licenses/by/4.0/`;
}

function bucketPeaks(samples) {
  const peaks = new Array(PEAK_BUCKETS).fill(0);
  if (samples.length === 0) {
    return peaks;
  }
  const size = samples.length / PEAK_BUCKETS;
  let max = 0;
  for (let index = 0; index < PEAK_BUCKETS; index += 1) {
    const start = Math.floor(index * size);
    const end = Math.min(samples.length, Math.floor((index + 1) * size));
    let peak = 0;
    for (let sampleIndex = start; sampleIndex < end; sampleIndex += 1) {
      const value = Math.abs(samples[sampleIndex] ?? 0);
      if (value > peak) {
        peak = value;
      }
    }
    peaks[index] = peak;
    if (peak > max) {
      max = peak;
    }
  }
  if (max === 0) {
    return peaks;
  }
  return peaks.map((peak) => Math.round((peak / max) * 1000) / 1000);
}

function durationSeconds(filePath) {
  const result = spawnSync(
    ffmpeg,
    ["-hide_banner", "-i", filePath, "-f", "null", "-"],
    {
      encoding: "utf8",
    }
  );
  const match = result.stderr.match(/Duration:\s+(\d+):(\d+):(\d+(?:\.\d+)?)/);
  if (match === null) {
    throw new Error(`No duration for ${filePath}`);
  }
  return Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
}

function runFfmpeg(args) {
  const result = spawnSync(ffmpeg, args, { encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(result.stderr || `ffmpeg failed: ${args.join(" ")}`);
  }
}

async function download(url, destination) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Download failed ${response.status} ${url}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, bytes);
}

async function mapPool(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (next < items.length) {
      const index = next;
      next += 1;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: limit }, () => run()));
  return results;
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
  return bucketPeaks(samples);
}

async function assetsReady() {
  try {
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    await readFile(peaksPath, "utf8");
    if (manifest.audio?.length !== AUDIO_COUNT) {
      return false;
    }
    for (const audio of manifest.audio) {
      await stat(path.join(audioDir, audio.file));
    }
    for (const image of manifest.images) {
      await stat(path.join(imageDir, image.file));
    }
    return true;
  } catch {
    return false;
  }
}

async function main() {
  if (await assetsReady()) {
    console.log("Seed assets already exist. Nothing to download.");
    return;
  }
  await mkdir(audioDir, { recursive: true });
  await mkdir(imageDir, { recursive: true });
  await mkdir(tmpDir, { recursive: true });

  console.log(`Checking ${CANDIDATES.length} Kevin MacLeod tracks for length.`);
  const measured = await mapPool(CANDIDATES, 4, async (title) => {
    const tempPath = path.join(tmpDir, `${slug(title)}-source.mp3`);
    try {
      await stat(tempPath);
    } catch {
      await download(sourceUrlFor(title), tempPath);
    }
    const seconds = durationSeconds(tempPath);
    console.log(`${seconds.toFixed(1)}s  ${title}`);
    return { title, seconds, tempPath };
  });
  const chosen = measured
    .filter(
      (track) => track.seconds >= MIN_SECONDS && track.seconds <= MAX_SECONDS
    )
    .sort((a, b) => a.title.localeCompare(b.title))
    .slice(0, AUDIO_COUNT);
  if (chosen.length < AUDIO_COUNT) {
    throw new Error(
      `Only ${chosen.length} tracks are between ${MIN_SECONDS}s and ${MAX_SECONDS}s.`
    );
  }

  const peaks = {};
  const audio = [];
  for (const track of chosen) {
    const file = `${slug(track.title)}.mp3`;
    const destination = path.join(audioDir, file);
    runFfmpeg([
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      track.tempPath,
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
      AUDIO_BITRATE,
      destination,
    ]);
    const seconds = durationSeconds(destination);
    peaks[file] = {
      durationMs: Math.round(seconds * 1000),
      peaks: decodePeaks(destination),
    };
    audio.push({
      file,
      sourceTitle: track.title,
      sourceUrl: sourceUrlFor(track.title),
      credit: creditFor(track.title),
      licence: "CC BY 4.0",
      durationMs: peaks[file].durationMs,
    });
    console.log(`Encoded ${file} (${seconds.toFixed(1)}s)`);
  }

  const images = [];
  const photoSources = JSON.parse(
    await readFile(path.join(root, "seed/image-sources.json"), "utf8")
  );
  for (const portrait of PORTRAITS) {
    const file = `avatar-${portrait.handle}.jpg`;
    await download(portrait.fetchUrl, path.join(imageDir, file));
    images.push({
      file,
      kind: "avatar",
      artistHandle: portrait.handle,
      sourceUrl: portrait.page,
      credit: `Photo: ${portrait.photographer} / Unsplash`,
      licence: "Unsplash License",
    });
  }
  for (const photo of photoSources.avatars) {
    const file = `avatar-${photo.handle}.jpg`;
    await download(
      `https://images.unsplash.com/photo-${photo.photoId}?w=800&h=800&fit=crop&q=75&fm=jpg`,
      path.join(imageDir, file)
    );
    images.push({
      file,
      kind: "avatar",
      artistHandle: photo.handle,
      sourceUrl: `https://unsplash.com${photo.page}`,
      credit: `Photo: ${photo.photographer} / Unsplash`,
      licence: "Unsplash License",
    });
  }
  for (const photo of photoSources.covers) {
    const file = `cover-${photo.handle}.jpg`;
    await download(
      `https://images.unsplash.com/photo-${photo.photoId}?w=1400&h=560&fit=crop&q=75&fm=jpg`,
      path.join(imageDir, file)
    );
    images.push({
      file,
      kind: "cover",
      artistHandle: photo.handle,
      sourceUrl: `https://unsplash.com${photo.page}`,
      credit: `Photo: ${photo.photographer} / Unsplash`,
      licence: "Unsplash License",
    });
  }
  for (const [index, photo] of photoSources.artworks.entries()) {
    const file = `artwork-${String(index + 1).padStart(2, "0")}.jpg`;
    await download(
      `https://images.unsplash.com/photo-${photo.photoId}?w=900&h=900&fit=crop&q=75&fm=jpg`,
      path.join(imageDir, file)
    );
    images.push({
      file,
      kind: "artwork",
      index,
      sourceUrl: `https://unsplash.com${photo.page}`,
      credit: `Photo: ${photo.photographer} / Unsplash`,
      licence: "Unsplash License",
    });
  }

  await writeFile(
    manifestPath,
    `${JSON.stringify({ audio, images }, null, 2)}\n`
  );
  await writeFile(peaksPath, `${JSON.stringify(peaks, null, 2)}\n`);
  const audioBytes = (
    await Promise.all(audio.map((item) => stat(path.join(audioDir, item.file))))
  ).reduce((sum, file) => sum + file.size, 0);
  const imageBytes = (
    await Promise.all(
      images.map((item) => stat(path.join(imageDir, item.file)))
    )
  ).reduce((sum, file) => sum + file.size, 0);
  console.log(
    `Audio ${(audioBytes / 1024 / 1024).toFixed(1)} MB, images ${(imageBytes / 1024 / 1024).toFixed(1)} MB, total ${((audioBytes + imageBytes) / 1024 / 1024).toFixed(1)} MB.`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
