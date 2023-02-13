import { Controller, Get, Render } from '@nestjs/common';

import { AllowRoles, Role } from '../session/guard/roles.decorator';

@Controller()
export class ReactController {
    @Get('*')
    @AllowRoles(Role.GUEST)
    @Render('react.hbs')
    getReact() {
        return {
            static: 'static/',
        };
    }
}
