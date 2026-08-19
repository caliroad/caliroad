import tsParser from "@typescript-eslint/parser"
import tsPlugin from "@typescript-eslint/eslint-plugin"

export default [
	{
		files: ["src/**/*.ts"],
		languageOptions: {
			parser: tsParser,
		},
		plugins: {
			"@typescript-eslint": tsPlugin,
		},
		rules: {
			"prefer-const": "warn",
			"@typescript-eslint/explicit-function-return-type": "warn",
			"@typescript-eslint/typedef": [
				"warn",
				{
					variableDeclaration: true,
					memberVariableDeclaration: true,
				},
			],
			"@typescript-eslint/no-inferrable-types": "off",
			"@typescript-eslint/no-explicit-any": "warn",
		},
	},
]
