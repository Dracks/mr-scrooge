import { IncomingMessage, ServerResponse } from 'http';
import { LoggerModule } from 'nestjs-pino';

import { errorToJson } from './errors/base-error';

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
