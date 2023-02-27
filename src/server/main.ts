import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger } from 'nestjs-pino';
import path from 'path';

import { AppModule } from './app.module';

const rootDir = __dirname;

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), { bufferLogs: true });

    const logger = app.get(Logger);

    app.useLogger(logger);

    await app.register(require('@fastify/secure-session'), {
        secret: 'averylogphrasebiggerthanthirtytwochars',
        salt: 'mq9hDxBVDbspDR6n',
        cookie: {
            path: '/',
        },
    });

    app.useStaticAssets({
        root: path.resolve(rootDir, '../static'),
        prefix: '/static/',
    });

    app.setViewEngine({
        engine: {
            handlebars: require('handlebars'),
        },
        templates: path.resolve(rootDir, 'templates/'),
    });

    await app.listen(3000);
}
bootstrap();
