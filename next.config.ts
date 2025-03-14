import type { NextConfig } from "next";

import pkg from "./package.json";

const loadConfig = (): NextConfig => ({
  env: { CONF_VER: pkg.version },
  devIndicators: false,
  images: { remotePatterns: [{ protocol: "https", hostname: "**" }] },
});

export default loadConfig;
