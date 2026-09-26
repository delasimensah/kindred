import { Suspense } from "react";

import StudioUpdateComposerPage from "@/components/pages/StudioUpdateComposerPage/StudioUpdateComposerPage";

export default function ComposeUpdatePage() {
  return (
    <Suspense
      fallback={
        <div className="px-4 py-8 text-sm text-text/50 sm:px-8 lg:px-10">
          Loading composer…
        </div>
      }
    >
      <StudioUpdateComposerPage />
    </Suspense>
  );
}
