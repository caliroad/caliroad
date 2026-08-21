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
					variableDeclaration: false,
					variableDeclarationIgnoreFunction: true,
					memberVariableDeclaration: true,
					parameter: true,
					propertyDeclaration: true,
				},
			],
			"@typescript-eslint/no-inferrable-types": "off",
		},
	},
]
