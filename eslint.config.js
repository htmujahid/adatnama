import { tanstackConfig } from "@tanstack/eslint-config"
import pluginQuery from "@tanstack/eslint-plugin-query"

export default [
  ...tanstackConfig,
  ...pluginQuery.configs["flat/recommended"],
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
  {
    ignores: [
      "src/components/ui",
      "src/lib/utils.ts",
      "eslint.config.js",
      "prettier.config.js",
      "worker-configuration.d.ts",
    ],
  },
]
