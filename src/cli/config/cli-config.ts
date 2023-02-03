import { IsString } from 'class-validator';

export class CliConfig {
    @IsString()
    migrationsFolder = './migrations';
}