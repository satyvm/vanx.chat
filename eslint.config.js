import { config } from "@vanx/eslint-config/base.js";

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
      ".astro/**",
    ],
  },
  {
    files: ["**/prisma/seed.ts", "**/seed.ts"],
    rules: {
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-misused-promises": "off",
    },
  },
];
