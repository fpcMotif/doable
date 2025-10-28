import type { NextConfig } from "next";

const config: NextConfig = {
  // Next.js 16 React Compiler and DynamicIO
  reactCompiler: true,
  dynamicIO: true,

  // Turbopack as default bundler (enabled by default in Next.js 16)
  turbo: {},

  typescript: {
    // Keep true initially, set to false after migration is complete
    ignoreBuildErrors: true,
  },

  eslint: {
    // Keep true initially, set to false after migration is complete
    ignoreDuringBuilds: true,
  },

  // next-intl configuration for internationalization
  i18n: {
    locales: ["en", "ja", "zh", "es", "de", "fr"],
    defaultLocale: "en",
  },
};

export default config;

