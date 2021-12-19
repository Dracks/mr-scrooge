import { IProfileData } from 'src/types/data';

export interface ISession extends IProfileData{
    username: string,
    email:string,
    is_authenticated: boolean
}

export interface ILogin {
    username: string
    password: string
}