import { Type } from 'class-transformer';
import { IsBoolean, IsNumber } from 'class-validator';

export class Config {
    @IsBoolean()
    @Type(()=>Boolean)
    readonly DEBUG : boolean = false;

    @IsNumber()
    @Type(()=>Number)
    readonly DECIMAL_COUNT :number = 2;

    @IsBoolean()
    readonly sessionUseLastActivity: boolean = true;

    @IsNumber()
    readonly sessionDaysActive: number = 7;
}
