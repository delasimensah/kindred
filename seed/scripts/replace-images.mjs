import { spawnSync } from "node:child_process";
import { readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
);
const imageDir = path.join(root, "seed/assets/images");
const manifestPath = path.join(root, "seed/manifest.json");
const sourcesPath = path.join(root, "seed/image-sources.json");

function pageUrl(page) {
  return `https://unsplash.com${page}`;
}

function fetchUrl(photoId, width, height) {
  return `https://images.unsplash.com/photo-${photoId}?w=${width}&h=${height}&fit=crop&q=75&fm=jpg`;
}

function credit(photographer) {
  return `Photo: ${photographer} / Unsplash`;
}

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
    const objectStart = text.indexOf("{");
    const arrayStart = text.indexOf("[");
    const start =
      objectStart === -1
        ? arrayStart
        : arrayStart === -1
          ? objectStart
          : Math.min(objectStart, arrayStart);
    const end = Math.max(text.lastIndexOf("}"), text.lastIndexOf("]"));
    if (start === -1 || end === -1) {
      throw new Error(`${functionName} did not return JSON\n${text}`);
    }
    return JSON.parse(text.slice(start, end + 1));
  }
}

async function download(url, destination) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "KindredSeed/1.0 (demo catalog; portfolio use)",
      Accept: "image/jpeg,image/*",
    },
  });
  if (!response.ok) {
    throw new Error(`Download failed ${response.status} ${url}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 5000) {
    throw new Error(`Image too small for ${destination}`);
  }
  await writeFile(destination, bytes);
}

async function uploadFile(uploadUrl, filePath) {
  const body = await readFile(filePath);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "image/jpeg" },
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
  const sources = JSON.parse(await readFile(sourcesPath, "utf8"));
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  if (sources.artworks.length !== 36 || sources.covers.length !== 12) {
    throw new Error("Image source list is the wrong length");
  }
  const replacements = [];

  for (const photo of sources.avatars) {
    const entry = manifest.images.find(
      (image) => image.kind === "avatar" && image.artistHandle === photo.handle
    );
    if (entry === undefined) {
      throw new Error(`Missing avatar ${photo.handle}`);
    }
    const file = `avatar-${photo.handle}.jpg`;
    await download(
      fetchUrl(photo.photoId, 800, 800),
      path.join(imageDir, file)
    );
    replacements.push({
      previousSourceUrl: entry.sourceUrl,
      sourceUrl: pageUrl(photo.page),
      credit: credit(photo.photographer),
      kind: "avatar",
      artistHandle: photo.handle,
      file,
      oldFile: entry.file,
      entry,
    });
    console.log(`Avatar ${photo.handle}`);
  }

  for (const photo of sources.covers) {
    const entry = manifest.images.find(
      (image) => image.kind === "cover" && image.artistHandle === photo.handle
    );
    if (entry === undefined) {
      throw new Error(`Missing cover ${photo.handle}`);
    }
    const file = `cover-${photo.handle}.jpg`;
    await download(
      fetchUrl(photo.photoId, 1400, 560),
      path.join(imageDir, file)
    );
    replacements.push({
      previousSourceUrl: entry.sourceUrl,
      sourceUrl: pageUrl(photo.page),
      credit: credit(photo.photographer),
      kind: "cover",
      artistHandle: photo.handle,
      file,
      oldFile: entry.file,
      entry,
    });
    console.log(`Cover ${photo.handle}`);
  }

  const artworks = manifest.images
    .filter((image) => image.kind === "artwork")
    .sort((left, right) => left.index - right.index);
  if (artworks.length !== sources.artworks.length) {
    throw new Error("Artwork count does not match");
  }
  for (const [index, photo] of sources.artworks.entries()) {
    const entry = artworks[index];
    const file = `artwork-${String(index + 1).padStart(2, "0")}.jpg`;
    await download(
      fetchUrl(photo.photoId, 900, 900),
      path.join(imageDir, file)
    );
    replacements.push({
      previousSourceUrl: entry.sourceUrl,
      sourceUrl: pageUrl(photo.page),
      credit: credit(photo.photographer),
      kind: "artwork",
      file,
      oldFile: entry.file,
      entry,
    });
    console.log(`Artwork ${file}`);
  }

  const uploaded = [];
  for (let offset = 0; offset < replacements.length; offset += 20) {
    const batch = replacements.slice(offset, offset + 20);
    const urls = convexRun("seedCatalog:generateUploadUrls", {
      count: batch.length,
    });
    for (const [index, item] of batch.entries()) {
      const storageId = await uploadFile(
        urls[index],
        path.join(imageDir, item.file)
      );
      const fileStat = await stat(path.join(imageDir, item.file));
      uploaded.push({
        previousSourceUrl: item.previousSourceUrl,
        sourceUrl: item.sourceUrl,
        storageId,
        contentType: "image/jpeg",
        sizeBytes: fileStat.size,
        credit: item.credit,
        kind: item.kind,
        ...(item.artistHandle === undefined
          ? {}
          : { artistHandle: item.artistHandle }),
      });
    }
  }
  const result = convexRun("seedCatalog:replaceSeedImages", {
    files: uploaded,
  });
  console.log(`Replaced ${result.replaced}, missing ${result.missing}.`);
  if (result.missing !== 0 || result.replaced !== replacements.length) {
    throw new Error("Not every image was replaced in Convex");
  }
  for (const item of replacements) {
    item.entry.file = item.file;
    item.entry.sourceUrl = item.sourceUrl;
    item.entry.credit = item.credit;
    item.entry.licence = "Unsplash License";
    if (item.oldFile !== item.file) {
      await unlink(path.join(imageDir, item.oldFile)).catch(() => undefined);
    }
  }
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
