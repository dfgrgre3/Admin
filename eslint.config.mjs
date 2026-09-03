import js from "@eslint/js";
import globals from "globals";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import typescriptParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

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
  // Native flat configs from the plugins themselves — no legacy eslintrc
  // bridge (FlatCompat) needed. Kept in sync with plugin majors; remove this
  // comment once both plugins are fully flat-only.
  react.configs.flat.recommended,
  reactHooks.configs.flat["recommended-latest"],
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
];
