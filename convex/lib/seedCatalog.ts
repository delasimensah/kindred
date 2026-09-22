import { GENRES } from "./genres";

export const SEED_AUDIO_COUNT = 40;
export const SEED_ARTWORK_COUNT = 36;
export const SEED_TRACK_COUNT = 500;
export const SEED_TRACK_CHUNK = 10;

const PUBLISHED_BASE_MS = Date.UTC(2026, 0, 15);
const DAY_MS = 86_400_000;

export type SeedArtist = {
  handle: string;
  name: string;
  bio: string;
  genre: (typeof GENRES)[number];
  hero: boolean;
  trackCount: number;
};

export type SeedTrackPlan = {
  artistHandle: string;
  title: string;
  audioIndex: number;
  artworkIndex: number;
  visibility: "public" | "supporters";
  state: "published" | "scheduled";
  genre: string;
  tags: string[];
  description?: string;
  publishedAt?: number;
  publishAt?: number;
};

export type SeedAccount = {
  role: "fan" | "supporter" | "artist" | "admin" | "audience";
  email: string;
  displayName: string;
  isAdmin: boolean;
  genres: string[];
  follows: string[];
  timezone: string;
  artistHandle?: string;
};

const ARTISTS: SeedArtist[] = [
  {
    handle: "amaara",
    name: "Amaara Mensah",
    bio: "Afro-soul and R&B · Accra",
    genre: "Afro-soul and R&B",
    hero: true,
    trackCount: 100,
  },
  {
    handle: "kweku-darko",
    name: "Kweku Darko",
    bio: "Highlife · Kumasi",
    genre: "Highlife",
    hero: true,
    trackCount: 88,
  },
  {
    handle: "sela-okoro",
    name: "Sela Okoro",
    bio: "Amapiano · Lagos",
    genre: "Amapiano",
    hero: true,
    trackCount: 78,
  },
  {
    handle: "tewa-nkrumah",
    name: "Téwá Nkrumah",
    bio: "Gospel · Accra",
    genre: "Gospel",
    hero: false,
    trackCount: 26,
  },
  {
    handle: "leye-ade",
    name: "Leye Ade",
    bio: "Afrobeats · Lagos",
    genre: "Afrobeats",
    hero: false,
    trackCount: 26,
  },
  {
    handle: "nia-osei",
    name: "Nia Osei",
    bio: "Alté · Accra",
    genre: "Alté",
    hero: false,
    trackCount: 26,
  },
  {
    handle: "chidi-nwosu",
    name: "Chidi Nwosu",
    bio: "Hip-hop and Drill · Lagos",
    genre: "Hip-hop and Drill",
    hero: false,
    trackCount: 26,
  },
  {
    handle: "adjoa-boateng",
    name: "Adjoa Boateng",
    bio: "Afro-house · Accra",
    genre: "Afro-house",
    hero: false,
    trackCount: 26,
  },
  {
    handle: "ibukun-balogun",
    name: "Ibukun Balogun",
    bio: "Jazz and Instrumental · Lagos",
    genre: "Jazz and Instrumental",
    hero: false,
    trackCount: 26,
  },
  {
    handle: "yaw-asante",
    name: "Yaw Asante",
    bio: "Reggae and Dancehall · Takoradi",
    genre: "Reggae and Dancehall",
    hero: false,
    trackCount: 26,
  },
  {
    handle: "zainab-diallo",
    name: "Zainab Diallo",
    bio: "Francophone Afropop · Accra",
    genre: "Francophone Afropop",
    hero: false,
    trackCount: 26,
  },
  {
    handle: "efe-okafor",
    name: "Efe Okafor",
    bio: "Afrobeats · Lagos",
    genre: "Afrobeats",
    hero: false,
    trackCount: 26,
  },
];

const TITLE_FIRST = [
  "Asase",
  "Gold",
  "Night",
  "Palm",
  "Lagoon",
  "Harmattan",
  "Coral",
  "Velvet",
  "Market",
  "Rain",
  "Copper",
  "Indigo",
  "Amber",
  "Silent",
  "Bright",
  "Slow",
  "Warm",
  "Open",
  "Hidden",
  "Little",
  "Last",
  "First",
  "Blue",
  "Red",
  "Soft",
];

const TITLE_SECOND = [
  "Light",
  "Road",
  "Water",
  "Drums",
  "Morning",
  "Letter",
  "Dance",
  "House",
  "Prayer",
  "Signal",
  "Garden",
  "Radio",
  "Window",
  "River",
  "Story",
  "Fever",
  "Crown",
  "Shore",
  "Echo",
  "Fire",
];

const RESERVED_NAMES = new Set(ARTISTS.map((artist) => artist.name));

const DEMO_ACCOUNTS: SeedAccount[] = [
  {
    role: "fan",
    email: "akosua.frimpong@kindred.example",
    displayName: "Akosua Frimpong",
    isAdmin: false,
    genres: ["Highlife", "Afrobeats"],
    follows: ["amaara", "kweku-darko"],
    timezone: "Africa/Accra",
  },
  {
    role: "supporter",
    email: "efua.boateng@kindred.example",
    displayName: "Efua Boateng",
    isAdmin: false,
    genres: ["Afro-soul and R&B", "Highlife", "Amapiano"],
    follows: ["amaara", "kweku-darko", "sela-okoro"],
    timezone: "Africa/Accra",
  },
  {
    role: "artist",
    email: "amaara.mensah@kindred.example",
    displayName: "Amaara Mensah",
    isAdmin: false,
    genres: ["Afro-soul and R&B"],
    follows: ["sela-okoro", "leye-ade"],
    timezone: "Africa/Accra",
    artistHandle: "amaara",
  },
  {
    role: "admin",
    email: "delasi.mensah@kindred.example",
    displayName: "Delasi Mensah",
    isAdmin: true,
    genres: ["Afrobeats", "Highlife"],
    follows: ["amaara", "sela-okoro"],
    timezone: "Africa/Accra",
  },
];

function titlePool(): string[] {
  const titles: string[] = [];
  for (const first of TITLE_FIRST) {
    for (const second of TITLE_SECOND) {
      titles.push(`${first} ${second}`);
    }
  }
  return titles;
}

export function seedArtists(): SeedArtist[] {
  return ARTISTS;
}

export function buildTrackPlan(): SeedTrackPlan[] {
  const pool = titlePool();
  let titleIndex = 0;
  let audioIndex = 0;
  let artworkIndex = 0;
  const tracks: SeedTrackPlan[] = [];
  for (const artist of ARTISTS) {
    for (let index = 0; index < artist.trackCount; index += 1) {
      const isAsase = artist.handle === "amaara" && index === 0;
      const title = isAsase ? "Asase" : pool[titleIndex];
      if (!isAsase) {
        titleIndex += 1;
      }
      if (title === undefined) {
        throw new Error("Seed title pool ran out");
      }
      const supportersOnly = artist.hero && index > 0 && index % 6 === 0;
      const scheduled =
        (artist.handle === "amaara" && (index === 3 || index === 9)) ||
        (artist.handle === "kweku-darko" && index === 4);
      const state = scheduled ? "scheduled" : "published";
      tracks.push({
        artistHandle: artist.handle,
        title,
        audioIndex: audioIndex % SEED_AUDIO_COUNT,
        artworkIndex: artworkIndex % SEED_ARTWORK_COUNT,
        visibility: supportersOnly ? "supporters" : "public",
        state,
        genre: artist.genre,
        tags: isAsase ? ["single"] : [],
        ...(isAsase
          ? { description: "Amaara's single, recorded in Accra." }
          : {}),
        ...(state === "published"
          ? {
              publishedAt:
                PUBLISHED_BASE_MS + (isAsase ? 1000 : index) * DAY_MS,
            }
          : { publishAt: Date.UTC(2026, 9, 1) + index * DAY_MS }),
      });
      audioIndex += 1;
      artworkIndex += 1;
    }
  }
  return tracks;
}

function audienceAccounts(): SeedAccount[] {
  const given = [
    "Kwame",
    "Abena",
    "Kofi",
    "Akua",
    "Yaw",
    "Esi",
    "Kojo",
    "Adwoa",
    "Fiifi",
    "Maame",
    "Tunde",
    "Chioma",
    "Segun",
    "Ngozi",
    "Femi",
    "Aisha",
    "Bola",
    "Ife",
    "Seyi",
    "Amaka",
  ];
  const family = [
    "Mensah",
    "Owusu",
    "Boateng",
    "Adeyemi",
    "Okonkwo",
    "Diallo",
    "Bello",
    "Quaye",
    "Addo",
    "Sarpong",
  ];
  const blocked = new Set([
    ...RESERVED_NAMES,
    ...DEMO_ACCOUNTS.map((account) => account.displayName),
  ]);
  const handles = ARTISTS.map((artist) => artist.handle);
  const accounts: SeedAccount[] = [];
  for (const first of given) {
    for (const last of family) {
      const displayName = `${first} ${last}`;
      if (blocked.has(displayName)) {
        continue;
      }
      const index = accounts.length;
      accounts.push({
        role: "audience",
        email: `${first}.${last}@kindred.example`.toLowerCase(),
        displayName,
        isAdmin: false,
        genres: [
          GENRES[index % GENRES.length],
          GENRES[(index + 3) % GENRES.length],
        ],
        follows: [
          handles[index % handles.length],
          handles[(index + 4) % handles.length],
        ],
        timezone: "Africa/Accra",
      });
      if (accounts.length === 40) {
        return accounts;
      }
    }
  }
  throw new Error("Not enough audience names");
}

export function seedAccounts(): SeedAccount[] {
  return [...DEMO_ACCOUNTS, ...audienceAccounts()];
}

export function demoAccounts(): SeedAccount[] {
  return DEMO_ACCOUNTS;
}
