/**
 * Kindred corner radii in px (locked in docs/design/design-system.md).
 *
 * Capsule chrome (pills, floating mini-player, tab bar) uses `full`.
 */

export const RADII = {
  /** Text inputs. */
  input: 10,
  /** Artwork, cards, buttons. */
  card: 12,
  button: 12,
  /** Fully rounded capsules. */
  full: 9999,
} as const;
