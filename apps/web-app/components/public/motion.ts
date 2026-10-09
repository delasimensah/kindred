import type { CSSProperties } from "react";

const MAX_STAGGER_STEPS = 8;

/** Delay for the nth item of a list that rises in. Long lists stop staggering after a few rows. */
export function stagger(index: number, stepMs = 50): CSSProperties {
  return {
    animationDelay: `${Math.min(index, MAX_STAGGER_STEPS) * stepMs}ms`,
  };
}
