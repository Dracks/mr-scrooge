import { Injectable, Logger } from "@nestjs/common";
import { Command } from "nestjs-command";

import { CustomError } from "../server/core/errors/base-error";

@Injectable()
export class LogsCommands {
    private logger= new Logger('LogsCommands');

    @Command({
        command: 'show-logger-examples',
        describe: 'Get some examples of logging',
    })
    async getLogs() {
        this.logger.log('Getting logs...');
        this.logger.debug({something: 'extra'}, 'Debug log')
        this.logger.warn('This is some warning with %s', 'extra');
        this.logger.error({err: new CustomError('ER0000', 'Some message', {context: 'extra'})}, 'we have some error')
    }
}