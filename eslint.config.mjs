import js from "@eslint/js";
import globals from "globals";
import { fileURLToPath } from "node:url";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import { FlatCompat } from "@eslint/eslintrc";

const flatCompat = new FlatCompat({
  baseDirectory: fileURLToPath(new URL(".", import.meta.url)),
});

export default [
  {
    ignores: [
      "node_modules/**",
      ".kilo/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "generated/**",
      "prisma/generated/**",
      "prisma/migrations/**",
      ".venv/**",
      "venv/**",
      "env/**",
      "**/__pycache__/**",
      "**/*.py",
      ".ide/**",
      "**/*.log",
      ".git-rewrite/**",
      "next-env.d.ts",
      "eslint-report.json",
    ],
  },
  js.configs.recommended,
  // Load the legacy eslintrc-based plugin configs through the modern
  // FlatCompat bridge instead of spreading their `.rules` by hand.
  ...flatCompat.extends("plugin:react/recommended", "plugin:react-hooks/recommended"),
  {
    files: ["**/*.{js,jsx,mjs,cjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        // Type-only global references used in type positions
        NodeJS: "readonly",
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "@typescript-eslint": typescriptEslint,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
    rules: {
      // Hook correctness rules are errors: violations can create stale data,
      // render loops, or side effects during render.
      "react-hooks/set-state-in-effect": "error",
      "react-hooks/exhaustive-deps": "error",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "error",
      "react/no-unescaped-entities": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off",
      // Disable base no-unused-vars in favor of TypeScript version
      "no-unused-vars": "off",
      // Disable no-undef for TypeScript files since TypeScript handles type checking
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      // Allow lexical declarations in case blocks
      "no-case-declarations": "off",
      // Allow styled-jsx properties
      "react/no-unknown-property": ["error", { ignore: ["jsx", "global"] }],
      // Prevent importing old/deprecated files
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/*.old.*", "**/*.old"],
              message: "ملفات .old.* غير موجودة وقد تسبب أخطاء. استخدم الملفات الحالية فقط. / .old.* files do not exist and will cause errors. Use current files only.",
            },
          ],
        },
      ],
    },
  },
  // Jest / Vitest globals for test files
  {
    files: ["**/*.test.{js,jsx,ts,tsx}", "**/*.spec.{js,jsx,ts,tsx}", "**/tests/**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        jest: "readonly",
        describe: "readonly",
        it: "readonly",
        test: "readonly",
        expect: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
        beforeAll: "readonly",
        afterAll: "readonly",
        vi: "readonly",
        vitest: "readonly",
      },
    },
    rules: {
      // Disable base no-unused-vars in favor of TypeScript version
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];
