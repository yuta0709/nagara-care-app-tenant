import type { Config } from "@react-router/dev/config";
import { copyFileSync } from "node:fs";
import { join } from "node:path";

export default {
  // Config options...
  // Server-side render by default, to enable SPA mode set this to `false`
  ssr: false,
  buildEnd: (args) => {
    if (!args.viteConfig.isProduction) return;
    const buildPath = args.viteConfig.build.outDir;
    copyFileSync(join(buildPath, "index.html"), join(buildPath, "404.html"));
  },
} satisfies Config;
