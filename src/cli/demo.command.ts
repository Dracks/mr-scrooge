import { Injectable } from '@nestjs/common';
import { Command, Option } from 'nestjs-command';

import { UserProfileService } from '../server/session/services/user-profile.service';
import { DemoDataService } from './demo-data.service';

@Injectable()
export class DemoCommand {
    constructor(
        readonly userService: UserProfileService,
        readonly demoDataService: DemoDataService,
    ) {}

    @Command({
        command: 'demouser',
        describe: 'create a user demo',
    })
    async demoUser(
        @Option({ name: 'user', alias: 'u', default: 'demo' }) username: string,
        @Option({ name: 'password', alias: 'p', default: 'demo' }) password: string,
    ) {
        const userInfo = await this.userService.addUser(username, password, { isActive: true });
        console.log(`User added ${userInfo.id}: ${userInfo.username} with groupId: ${userInfo.groupId}`)
    }

    @Command({
        command: 'demodata',
        describe: 'will generate demo data for a group'
    })
    async demoData(
        @Option({ name: 'group', alias: 'g', requiresArg: true, type: 'number' }) groupId: number,
    ){
        await this.demoDataService.generateAll(groupId)
    }
}
