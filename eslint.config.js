const js = require("@eslint/js");
const nextPlugin = require("@next/eslint-plugin-next");
const globals = require("globals");
const tseslint = require("typescript-eslint");

module.exports = [
  {
    ignores: [
      "node_modules/**",
      ".venv/**",
      ".next/**",
      ".next-build/**",
      "out/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "public/**",
      "prisma/migrations/**",
      "neural-core/**",
      "eslint.config.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: {
      "@next/next": nextPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      "@typescript-eslint/no-unused-expressions": "off",
      "no-unused-expressions": [
        "warn",
        { allowShortCircuit: true, allowTernary: true, allowTaggedTemplates: true }
      ],
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }
      ],
      "no-empty": "warn",
      "no-case-declarations": "warn",
      "no-useless-escape": "warn",
      "prefer-const": "warn",
    },
  },
];
