import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { BankMovement } from "./models/bank-movement.model";

@Module({
    imports: [SequelizeModule.forFeature([BankMovement])]
    
})
export class BankMovementModule{}