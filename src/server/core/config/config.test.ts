import { Global, Module } from '@nestjs/common';
import * as Factory from 'factory.ts';

import { Config } from './config';

export const configTestFactory = Factory.Sync.makeFactory<Config>({
    sessionDaysActive: 10,
    sessionUseLastActivity: true,
    DEBUG: true,
    DECIMAL_COUNT: 2,
});

@Global()
@Module({
    providers: [{ provide: Config, useValue: configTestFactory.build() }],
    exports: [Config],
})
export class ConfigTestModule {
    static forRoot(config: Config) {
        return {
            module: ConfigTestModule,
            providers: [{ provide: Config, useValue: config }],
        };
    }
}
