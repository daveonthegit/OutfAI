import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      ".next/",
      "dist/",
      "coverage/",
      ".vercel/",
      "**/*.config.mjs",
      "**/*.d.ts",
      // shadcn/ui generated components — do not lint
      "apps/web/components/ui/",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-undef": "off",
      "@typescript-eslint/no-unused-expressions": [
        "warn",
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-require-imports": "warn",
      "no-constant-binary-expression": "warn",
      "no-prototype-builtins": "warn",
      "no-constant-condition": "warn",
    },
  }
);
