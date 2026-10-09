import React from "react";

const BAR_DELAYS_MS = [0, 240, 120];

const PlayingBars: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <span
      aria-hidden
      className={`flex h-3 items-end gap-[2px] text-primary ${className}`}
    >
      {BAR_DELAYS_MS.map((delay) => (
        <span
          key={delay}
          style={{ animationDelay: `${delay}ms` }}
          className="h-full w-[3px] origin-bottom scale-y-50 rounded-full bg-current motion-safe:animate-eq"
        />
      ))}
    </span>
  );
};

export default PlayingBars;
