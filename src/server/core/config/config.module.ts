import { dotenvLoader, TypedConfigModule } from 'nest-typed-config';

import { Config } from './config';

export const ConfigModule = TypedConfigModule.forRoot({
    schema: Config,
    load: dotenvLoader({
        /* options */
    }),
});
