import { Logger } from "./logger/logger.class";

export const catchAndLog = (p: Promise<unknown>, msg: string,  logger: Logger) => {
    p.catch((error: unknown) => { logger.error(msg, { error }) })
}