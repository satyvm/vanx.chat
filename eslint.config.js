import { config } from "@workspace/eslint-config/base.js";

/** @type {import("eslint").Linter.Config[]} */
export default [
  ...config,
  {
    ignores: [
      "apps/**", 
      "packages/**",
      "node_modules/**",
      "dist/**",
      ".next/**",
      ".astro/**"
    ],
  },
];
