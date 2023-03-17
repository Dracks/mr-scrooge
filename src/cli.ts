import { NestFactory } from '@nestjs/core';
import { CommandModule, CommandService } from 'nestjs-command';
import { Logger } from 'nestjs-pino';

import { CliModule } from './cli/cli.module';

const bootstrap = async () => {
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

// eslint-disable-next-line no-console
bootstrap().catch(error => console.error(error));
