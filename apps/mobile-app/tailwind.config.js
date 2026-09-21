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
  } catch (e) {
    // tsconfig-paths not available, continue without it
  }
} catch (e) {
  console.warn("ts-node not available, ensure constants are compiled to JS");
}

/** @type {import('tailwindcss').Config} */
const { COLORS, RADII } = require("../../packages/shared/src/constants");
let FONTS;
try {
  const fontsModule = require("./constants/fonts.ts");
  FONTS = fontsModule.FONTS;
} catch (e) {
  console.warn("Could not load fonts.ts:", e.message);
  FONTS = {
    light: "Satoshi-Light",
    regular: "Satoshi-Regular",
    medium: "Satoshi-Medium",
    semibold: "Satoshi-Bold",
    bold: "Satoshi-Bold",
    black: "Satoshi-Black",
    displaySemibold: "ClashDisplay-Semibold",
    displayBold: "ClashDisplay-Bold",
  };
}

module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx,mdx}",
    "./components/**/*.{js,jsx,ts,tsx,mdx}",
  ],
  presets: [require("nativewind/preset")],
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
      fontFamily: {
        "app-light": [FONTS.light],
        "app-regular": [FONTS.regular],
        "app-medium": [FONTS.medium],
        "app-semibold": [FONTS.semibold],
        "app-bold": [FONTS.bold],
        "app-black": [FONTS.black],
        "display-semibold": [FONTS.displaySemibold],
        "display-bold": [FONTS.displayBold],
      },
    },
  },
  plugins: [],
};
