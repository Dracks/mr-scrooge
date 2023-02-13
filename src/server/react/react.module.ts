import { Module } from '@nestjs/common';

import { ReactController } from './react.controller';

@Module({
    controllers: [ReactController],
})
export class ReactModule {}
