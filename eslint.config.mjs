// @ts-check
import vitest from '@vitest/eslint-plugin';
import tseslint from 'typescript-eslint';
import sis from 'eslint-plugin-simple-import-sort';

export default [
    ...tseslint.config(
      // ...eslint.configs.recommended,
      ...tseslint.configs.strictTypeChecked,
      {
          languageOptions: {
            parserOptions: {
              projectService: true,
              tsconfigRootDir: import.meta.dirname,
            },
          },
        },
    ),
      {
        rules: {
          "sort-imports": 'off'
        }
      },
    {
      plugins: {
        "simple-import-sort":sis,
      },
      rules: {
          "simple-import-sort/exports": [
              "error"
          ],
          "simple-import-sort/imports": [
              "error",
              {
                  "groups": [
                      [
                          "^@?\\w"
                      ],
                      [
                          "^(src|lib|test|\\.)"
                      ]
                  ]
              }
          ]
      }
    },
    {
      ignores: ["**/generated-models.ts"]
    },
    {
      files: ['srv/**/*.spec.ts'], // or any other pattern
      plugins: {
        vitest,
      },
      rules: {
        ...vitest.configs.recommended.rules, // you can also use vitest.configs.all.rules to enable all rules
        'vitest/max-nested-describe': ['error', { max: 3 }], // you can also modify rules' behavior using option like this
      },
    }
];
