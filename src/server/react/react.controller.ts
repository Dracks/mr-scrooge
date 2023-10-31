import { Controller, Get, Logger, OnModuleInit, Render } from '@nestjs/common';
import fs from 'fs';
import path from 'path';

import { Config } from '../core/config/config';
import { AllowRoles, Role } from '../session/guard/roles.decorator';

interface ReactContext {
    debug: boolean;
    static: '/static/';
    version?: string;
}
@Controller()
export class ReactController implements OnModuleInit {
    private logger = new Logger(ReactController.name);

    private ctx: ReactContext;

    constructor(config: Config) {
        this.ctx = {
            static: '/static/',
            debug: config.DEBUG,
        };
    }

    onModuleInit() {
        const pFile = path.resolve(__dirname, '../../package.json');
        fs.readFile(pFile, (err, data) => {
            if (err) {
                this.logger.error(err, 'Error loading package.json');
            } else if (data) {
                this.ctx.version = JSON.parse(data.toString()).version;
            }
        });
    }

    @Get('*')
    @AllowRoles(Role.GUEST)
    @Render('react')
    getReact() {
        this.logger.log(this.ctx, 'rendering react');
        return this.ctx;
    }
}
