import { Injectable, Logger } from '@nestjs/common';
import { Command } from 'nestjs-command';

import { Exception } from '../server/core/errors/exception';

@Injectable()
export class LogsCommands {
    private logger = new Logger('LogsCommands');

    @Command({
        command: 'show-logger-examples',
        describe: 'Get some examples of logging',
    })
    getLogs() {
        this.logger.log('Getting logs...');
        this.logger.debug({ something: 'extra' }, 'Debug log');
        this.logger.warn('This is some warning with %s', 'extra');
        this.logger.error({ err: new Exception('E10000', 'Test message', { context: 'extra' }) }, 'we have some error');
    }
}
