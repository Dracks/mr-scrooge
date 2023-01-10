import { Injectable } from "@nestjs/common";
import { Command, Option } from "nestjs-command";

import { UserProfileService } from "../server/session/user-profile.service";

@Injectable()
export class DemoCommand {
    constructor(readonly userService: UserProfileService){}

    @Command({
        command: 'demouser',
        describe: 'create a user demo',
      })
    async demoUser(@Option({name: 'user', alias: 'u', default: 'demo'}) username: string, @Option({name: 'password', alias: 'p', default: 'demo'}) password: string){
        await this.userService.addUser(username,password, {isActive: true});
    }
}