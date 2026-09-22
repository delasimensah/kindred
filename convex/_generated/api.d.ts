/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as artists from "../artists.js";
import type * as auth from "../auth.js";
import type * as follows from "../follows.js";
import type * as http from "../http.js";
import type * as lib_accountPassword from "../lib/accountPassword.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_follows from "../lib/follows.js";
import type * as lib_functions from "../lib/functions.js";
import type * as lib_genres from "../lib/genres.js";
import type * as lib_peaks from "../lib/peaks.js";
import type * as lib_profileName from "../lib/profileName.js";
import type * as lib_seedCatalog from "../lib/seedCatalog.js";
import type * as lib_tracks from "../lib/tracks.js";
import type * as profiles from "../profiles.js";
import type * as seed from "../seed.js";
import type * as seedAvatars from "../seedAvatars.js";
import type * as seedCatalog from "../seedCatalog.js";
import type * as tracks from "../tracks.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  artists: typeof artists;
  auth: typeof auth;
  follows: typeof follows;
  http: typeof http;
  "lib/accountPassword": typeof lib_accountPassword;
  "lib/auth": typeof lib_auth;
  "lib/errors": typeof lib_errors;
  "lib/follows": typeof lib_follows;
  "lib/functions": typeof lib_functions;
  "lib/genres": typeof lib_genres;
  "lib/peaks": typeof lib_peaks;
  "lib/profileName": typeof lib_profileName;
  "lib/seedCatalog": typeof lib_seedCatalog;
  "lib/tracks": typeof lib_tracks;
  profiles: typeof profiles;
  seed: typeof seed;
  seedAvatars: typeof seedAvatars;
  seedCatalog: typeof seedCatalog;
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
