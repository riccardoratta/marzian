import { version } from "./package.json";

import type { NextConfig } from "next";

const loadConfig = (): NextConfig => ({
  devIndicators: false,
  env: { NEXT_PUBLIC_VERSION: version },

  images: {
    qualities: [75, 100],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
});

export default loadConfig;
