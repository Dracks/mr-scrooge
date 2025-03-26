// @ts-check

import eslint from '@eslint/js';
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
    }
];
