import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { bufferLogs: true });

    const logger = app.get(Logger);

    app.useLogger(logger);

    logger.log('test', { object: 'something' });
    console.log(logger);

    await app.register(require('@fastify/secure-session'), {
        secret: 'averylogphrasebiggerthanthirtytwochars',
        salt: 'mq9hDxBVDbspDR6n',
        cookie: {
            path: '/',
        },
    });

    await app.listen(3000);
}
bootstrap();
