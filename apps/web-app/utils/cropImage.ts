import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = src;
  });
}

/**
 * Draws the cropped pixel region to a canvas and returns a JPEG File ready to upload.
 */
export async function cropImageToFile(args: {
  imageSrc: string;
  croppedAreaPixels: Area;
  fileName: string;
  maxEdge?: number;
  quality?: number;
}): Promise<File> {
  const image = await loadImage(args.imageSrc);
  const { width, height, x, y } = args.croppedAreaPixels;
  const maxEdge = args.maxEdge ?? 1600;
  const scale = Math.min(1, maxEdge / Math.max(width, height));
  const outputWidth = Math.max(1, Math.round(width * scale));
  const outputHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Could not crop image");
  }

  context.drawImage(
    image,
    x,
    y,
    width,
    height,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => {
        if (result) {
          resolve(result);
        } else {
          reject(new Error("Could not crop image"));
        }
      },
      "image/jpeg",
      args.quality ?? 0.92
    );
  });

  const baseName = args.fileName.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${baseName}.jpg`, { type: "image/jpeg" });
}
