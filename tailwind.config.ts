// @ts-expect-error This file does not have type definitions.
import nativewindPreset from "nativewind/dist/tailwind/index.js";
import type { Config } from "tailwindcss";

export default {
  content: ["./App.tsx", "./src/**/*.{js,ts,tsx}"],
  plugins: [],
  presets: [nativewindPreset],
} satisfies Config;
