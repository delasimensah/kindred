/** Shared Mantine Select / TagsInput chrome for Studio forms. */
export const studioFieldClassNames = {
  label: "mb-2 text-sm text-text/70",
  input: "rounded-xl border-white/10 bg-page px-4 py-3 text-sm text-text",
  dropdown:
    "rounded-xl border border-white/10 bg-page p-1.5 text-text shadow-xl",
  option:
    "rounded-lg text-sm text-text hover:!bg-primary/15 hover:!text-primary data-[combobox-active]:!bg-primary/20 data-[combobox-active]:!text-primary data-[combobox-selected]:!bg-primary data-[combobox-selected]:!text-textOnPrimary",
  pill: "border border-primary/30 bg-primary/15 text-primary",
  error: "mt-1.5 text-sm text-danger",
} as const;
