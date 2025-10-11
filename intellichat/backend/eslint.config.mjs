// eslint.config.mjs
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";

export default tseslint.config(
    js.configs.recommended,
    ...tseslint.configs.recommended,
    prettier,
    {
        files: ["src/**/*.ts"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
        },
        plugins: {
            "@typescript-eslint": tseslint.plugin,
            prettier: prettierPlugin,
        },
        rules: {
            // --- TypeScript rules ---
            "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/consistent-type-imports": "error",
            "no-prototype-builtins": "off",
            "@typescript-eslint/no-empty-object-type": "off",
            "no-case-declarations": "warn",
            "@typescript-eslint/no-unsafe-function-type": "warn",

            // --- General JavaScript best practices ---
            "no-var": "error",
            "prefer-const": "error",
            "eqeqeq": ["error", "always"],
            "curly": ["error", "all"],

            // --- Prettier integration ---
            "prettier/prettier": ["error"],
        },
    }
);
