const HANDLE_MAX = 32;

/** URL-safe handle from a display name. Empty names become "artist". */
export function handleBaseFromDisplayName(displayName: string): string {
  const slug = displayName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, HANDLE_MAX);
  return slug.length > 0 ? slug : "artist";
}

/** Keep `name-2` inside the handle length when a name is already taken. */
export function handleWithSuffix(base: string, suffix: number): string {
  const tail = `-${suffix}`;
  const room = Math.max(1, HANDLE_MAX - tail.length);
  return `${base.slice(0, room).replace(/-+$/g, "")}${tail}`;
}
