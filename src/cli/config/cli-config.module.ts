import { dotenvLoader, TypedConfigModule } from 'nest-typed-config';

import { CliConfig } from './cli-config';

export const CliConfigModule = TypedConfigModule.forRoot({
    schema: CliConfig,
    load: dotenvLoader({
        /* options */
    }),
});
