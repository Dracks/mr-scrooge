import { IsBoolean, IsNumber } from 'class-validator';

export class Config {
    @IsBoolean()
    readonly sessionUseLastActivity: boolean = true;

    @IsNumber()
    readonly sessionDaysActive: number = 7;
}
