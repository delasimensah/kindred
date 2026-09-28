/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as ai from "../ai.js";
import type * as artistRequests from "../artistRequests.js";
import type * as artists from "../artists.js";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as discovery from "../discovery.js";
import type * as earnings from "../earnings.js";
import type * as feed from "../feed.js";
import type * as follows from "../follows.js";
import type * as http from "../http.js";
import type * as lib_access from "../lib/access.js";
import type * as lib_accountPassword from "../lib/accountPassword.js";
import type * as lib_artistRequestHandle from "../lib/artistRequestHandle.js";
import type * as lib_artistStats from "../lib/artistStats.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_files from "../lib/files.js";
import type * as lib_follows from "../lib/follows.js";
import type * as lib_functions from "../lib/functions.js";
import type * as lib_genres from "../lib/genres.js";
import type * as lib_library from "../lib/library.js";
import type * as lib_peaks from "../lib/peaks.js";
import type * as lib_presence from "../lib/presence.js";
import type * as lib_profileName from "../lib/profileName.js";
import type * as lib_reactions from "../lib/reactions.js";
import type * as lib_routes from "../lib/routes.js";
import type * as lib_seedCatalog from "../lib/seedCatalog.js";
import type * as lib_seedVoice from "../lib/seedVoice.js";
import type * as lib_tracks from "../lib/tracks.js";
import type * as library from "../library.js";
import type * as listen from "../listen.js";
import type * as player from "../player.js";
import type * as posts from "../posts.js";
import type * as presence from "../presence.js";
import type * as profiles from "../profiles.js";
import type * as reactions from "../reactions.js";
import type * as releases from "../releases.js";
import type * as seed from "../seed.js";
import type * as seedAvatars from "../seedAvatars.js";
import type * as seedCatalog from "../seedCatalog.js";
import type * as studio from "../studio.js";
import type * as studioReleases from "../studioReleases.js";
import type * as studioTracks from "../studioTracks.js";
import type * as thankYous from "../thankYous.js";
import type * as tracks from "../tracks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  ai: typeof ai;
  artistRequests: typeof artistRequests;
  artists: typeof artists;
  auth: typeof auth;
  crons: typeof crons;
  discovery: typeof discovery;
  earnings: typeof earnings;
  feed: typeof feed;
  follows: typeof follows;
  http: typeof http;
  "lib/access": typeof lib_access;
  "lib/accountPassword": typeof lib_accountPassword;
  "lib/artistRequestHandle": typeof lib_artistRequestHandle;
  "lib/artistStats": typeof lib_artistStats;
  "lib/auth": typeof lib_auth;
  "lib/errors": typeof lib_errors;
  "lib/files": typeof lib_files;
  "lib/follows": typeof lib_follows;
  "lib/functions": typeof lib_functions;
  "lib/genres": typeof lib_genres;
  "lib/library": typeof lib_library;
  "lib/peaks": typeof lib_peaks;
  "lib/presence": typeof lib_presence;
  "lib/profileName": typeof lib_profileName;
  "lib/reactions": typeof lib_reactions;
  "lib/routes": typeof lib_routes;
  "lib/seedCatalog": typeof lib_seedCatalog;
  "lib/seedVoice": typeof lib_seedVoice;
  "lib/tracks": typeof lib_tracks;
  library: typeof library;
  listen: typeof listen;
  player: typeof player;
  posts: typeof posts;
  presence: typeof presence;
  profiles: typeof profiles;
  reactions: typeof reactions;
  releases: typeof releases;
  seed: typeof seed;
  seedAvatars: typeof seedAvatars;
  seedCatalog: typeof seedCatalog;
  studio: typeof studio;
  studioReleases: typeof studioReleases;
  studioTracks: typeof studioTracks;
  thankYous: typeof thankYous;
  tracks: typeof tracks;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
