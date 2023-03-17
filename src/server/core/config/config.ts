import { Type } from 'class-transformer';
import { IsBoolean, IsNumber } from 'class-validator';

export class Config {
    @IsBoolean()
    @Type(()=>Boolean)
    readonly DEBUG : boolean = false;

    @IsBoolean()
    readonly sessionUseLastActivity: boolean = true;

    @IsNumber()
    readonly sessionDaysActive: number = 7;
}
