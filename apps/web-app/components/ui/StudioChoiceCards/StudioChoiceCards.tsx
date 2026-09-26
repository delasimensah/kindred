"use client";

import React from "react";
import { cn } from "shared";

export type StudioChoiceOption<T extends string> = {
  value: T;
  label: string;
  description?: string;
};

interface StudioChoiceCardsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options: StudioChoiceOption<T>[];
  columns?: 1 | 2;
  name: string;
}

function StudioChoiceCards<T extends string>({
  value,
  onChange,
  options,
  columns = 2,
  name,
}: StudioChoiceCardsProps<T>) {
  return (
    <div
      className={cn(
        "grid gap-4",
        columns === 2 ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"
      )}
      role="radiogroup"
      aria-label={name}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <label
            key={option.value}
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border bg-page px-4 py-4 transition",
              selected
                ? "border-primary/60"
                : "border-white/10 hover:border-white/20"
            )}
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={selected}
              onChange={() => onChange(option.value)}
              className="mt-1 accent-[#FFD369]"
            />
            <span>
              <span className="block text-sm font-medium text-text">
                {option.label}
              </span>
              {option.description ? (
                <span className="mt-1 block text-xs text-text/45">
                  {option.description}
                </span>
              ) : null}
            </span>
          </label>
        );
      })}
    </div>
  );
}

export default StudioChoiceCards;
