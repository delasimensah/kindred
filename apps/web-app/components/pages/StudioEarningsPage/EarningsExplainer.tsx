"use client";

import { IconInfoCircle } from "@tabler/icons-react";
import React from "react";

const EarningsExplainer: React.FC = () => {
  return (
    <div className="mb-8 rounded-2xl border border-white/5 bg-surface p-6 sm:p-7">
      <div className="mb-5 flex items-center gap-2">
        <IconInfoCircle size={16} className="text-primary" />
        <h2 className="text-base font-semibold text-text">
          How it&apos;s calculated
        </h2>
      </div>
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="flex gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <span className="font-display text-sm text-primary">70%</span>
          </div>
          <p className="text-sm leading-relaxed text-text/60">
            Of every supporter&apos;s monthly plan goes into the artist pool
            after store fees.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
            <span className="text-sm text-text/60">=</span>
          </div>
          <p className="text-sm leading-relaxed text-text/60">
            The pool splits equally across every artist that supporter has
            routed to.
          </p>
        </div>
        <div className="flex gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
            <span className="text-sm text-text/60">you</span>
          </div>
          <p className="text-sm leading-relaxed text-text/60">
            You get your equal share for every plan where you&apos;re one of the
            routed artists.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EarningsExplainer;
