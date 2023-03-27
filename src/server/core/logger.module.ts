import { LoggerModule } from 'nestjs-pino';

export const MyLoggerModule = LoggerModule.forRoot({
    pinoHttp: {
        transport: {
            target: 'pino-pretty',
        },
        autoLogging: false,
        quietReqLogger: true,
        // nestedKey: 'extraContext',
    },
});
