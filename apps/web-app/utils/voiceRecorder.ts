"use client";

/**
 * Browser voice recording via MediaRecorder + getUserMedia.
 * Safari prefers audio/mp4; Chrome prefers audio/webm.
 */

export type VoiceRecorderSupport = { ok: true } | { ok: false; reason: string };

export function getVoiceRecorderSupport(): VoiceRecorderSupport {
  if (typeof window === "undefined") {
    return { ok: false, reason: "Voice notes need a browser." };
  }
  if (
    typeof navigator === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    return {
      ok: false,
      reason: "This browser cannot access the microphone.",
    };
  }
  if (typeof MediaRecorder === "undefined") {
    return {
      ok: false,
      reason: "This browser cannot record voice notes.",
    };
  }
  return { ok: true };
}

function pickMimeType(): string | undefined {
  const candidates = [
    "audio/mp4",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
  ];
  for (const type of candidates) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return undefined;
}

function extensionForMime(mime: string): string {
  if (mime.includes("mp4") || mime.includes("m4a") || mime.includes("aac")) {
    return "m4a";
  }
  if (mime.includes("ogg")) {
    return "ogg";
  }
  return "webm";
}

export type VoiceRecording = {
  file: File;
  objectUrl: string;
};

export type ActiveVoiceRecorder = {
  stop: () => Promise<VoiceRecording>;
  cancel: () => void;
};

export async function startVoiceRecording(): Promise<ActiveVoiceRecorder> {
  const support = getVoiceRecorderSupport();
  if (!support.ok) {
    throw new Error(support.reason);
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const mimeType = pickMimeType();
  const recorder = mimeType
    ? new MediaRecorder(stream, { mimeType })
    : new MediaRecorder(stream);
  const chunks: BlobPart[] = [];

  recorder.ondataavailable = (event) => {
    if (event.data.size > 0) {
      chunks.push(event.data);
    }
  };

  recorder.start(250);

  const stopTracks = () => {
    for (const track of stream.getTracks()) {
      track.stop();
    }
  };

  return {
    stop: () =>
      new Promise((resolve, reject) => {
        recorder.onerror = () => {
          stopTracks();
          reject(new Error("Recording failed"));
        };
        recorder.onstop = () => {
          stopTracks();
          const type = recorder.mimeType || mimeType || "audio/webm";
          const blob = new Blob(chunks, { type });
          if (blob.size === 0) {
            reject(new Error("Recording was empty"));
            return;
          }
          const file = new File(
            [blob],
            `voice-note.${extensionForMime(type)}`,
            { type }
          );
          resolve({ file, objectUrl: URL.createObjectURL(blob) });
        };
        if (recorder.state === "inactive") {
          stopTracks();
          reject(new Error("Recording already stopped"));
          return;
        }
        recorder.stop();
      }),
    cancel: () => {
      try {
        if (recorder.state !== "inactive") {
          recorder.stop();
        }
      } catch {
        // ignore
      }
      stopTracks();
    },
  };
}
