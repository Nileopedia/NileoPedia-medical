import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"] },
  {
    files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"],
    extends: [
      pluginJs.configs.recommended,
      ...tseslint.configs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
    },
    rules: {
      "react/react-in-jsx-scope": "off",
    },
  }
);