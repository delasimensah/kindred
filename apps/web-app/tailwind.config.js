// Register ts-node to enable TypeScript support in Tailwind config
try {
  require("ts-node").register({
    transpileOnly: true,
    compilerOptions: {
      module: "commonjs",
      esModuleInterop: true,
      moduleResolution: "node",
      target: "es2020",
      skipLibCheck: true,
      baseUrl: ".",
      paths: {
        "@/*": ["./*"],
        shared: ["../../packages/shared/src/index.ts"],
        "shared/*": ["../../packages/shared/src/*"],
      },
    },
    skipProject: true,
  });

  try {
    require("tsconfig-paths").register({
      baseUrl: ".",
      paths: {
        "@/*": ["./*"],
        shared: ["../../packages/shared/src/index.ts"],
        "shared/*": ["../../packages/shared/src/*"],
      },
    });
  } catch (error) {
    // tsconfig-paths not available, continue without it
    console.error("tsconfig-paths not available, continue without it", error);
  }
} catch (error) {
  console.error(
    "ts-node not available, ensure constants are compiled to JS",
    error
  );
}

/** @type {import('tailwindcss').Config} */
const { COLORS, RADII } = require("../../packages/shared/src/constants");

module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        page: COLORS.page,
        surface: COLORS.surface,
        primary: COLORS.primary,
        text: COLORS.text,
        textOnPrimary: COLORS.textOnPrimary,
        white: COLORS.white,
        black: COLORS.black,
        danger: COLORS.danger,
      },
      borderRadius: {
        input: `${RADII.input}px`,
        card: `${RADII.card}px`,
        button: `${RADII.button}px`,
        capsule: `${RADII.full}px`,
      },
      boxShadow: {
        card: `0 8px 24px color-mix(in srgb, ${COLORS.page} 40%, transparent), 0 2px 6px color-mix(in srgb, ${COLORS.page} 24%, transparent)`,
      },
      fontFamily: {
        ui: ["var(--font-ui)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-ui)", "system-ui", "sans-serif"],
        appFont: ["var(--font-ui)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
