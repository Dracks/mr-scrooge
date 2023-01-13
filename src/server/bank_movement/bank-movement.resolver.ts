import { Logger } from "@nestjs/common";
import { Resolver } from "@nestjs/graphql";
import { CursorHandler } from "../common/cursor-handler";
import { BankMovementService } from "./bank-movement.service";

import { BankMovement } from "./gql-objects/bank-movement.objects";

@Resolver(()=>BankMovement)
export class BankMovementResolver {
    private readonly logger = new Logger(BankMovementResolver.name)

    

    constructor(readonly bankMovementService: BankMovementService){}


}