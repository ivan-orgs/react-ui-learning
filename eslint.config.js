import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

// Concept: ESLint flat config.
// What it means: lint rules catch common bugs before runtime.
// Seen in app: npm.cmd run lint checks React hooks and TypeScript files.
export default tseslint.config(
  { ignores: ["dist", "*.d.ts"] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: {
      // Concept: React Hooks lint rules.
      // What it means: warns when hook dependencies or hook usage are unsafe.
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": "off"
    }
  }
);
