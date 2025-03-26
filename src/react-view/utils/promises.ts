import { Logger } from './logger/logger.class';

export const catchAndLog = (p: Promise<unknown>, msg: string, logger: Logger) => {
    p.catch((error: unknown) => {
        console.log(error);
        logger.error(msg, { error });
    });
};
