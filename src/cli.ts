import { NestFactory } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { CommandModule, CommandService } from 'nestjs-command';

import { CliModule } from './cli/cli.module';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(CliModule, {});

    const logger = app.get(Logger);

    app.useLogger(logger);

    try {
        await app.select(CommandModule).get(CommandService).exec();
        await app.close();
    } catch (error) {
        logger.error(error);
        await app.close();
        process.exit(1);
    }
}

bootstrap();