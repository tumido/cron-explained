import js from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";

export default tseslint.config(
  {
    ignores: [".vscode-test", "out"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.stylistic,
  {
    plugins: {
      "@stylistic": stylistic,
    },
    rules: {
      curly: "warn",
      "@stylistic/semi": ["warn", "always"],
      "@typescript-eslint/naming-convention": "warn",
      '@typescript-eslint/no-empty-function': 'off',
      eqeqeq: "warn",
      "no-throw-literal": "warn",
    },
  }
);
