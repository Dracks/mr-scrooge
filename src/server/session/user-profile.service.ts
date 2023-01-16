import { Injectable, Logger } from "@nestjs/common";
import {InjectRepository} from '@mikro-orm/nestjs';
import {EntityRepository} from '@mikro-orm/core'


import { UserEntity } from "./entities/user.entity";
import { PasswordService } from "./password.service";


const SECRET_KEY = '2&_7krtq544)s^9=8i$om!u+9ump*)#-7rcrka9pjld2nnk6p='

const emptyProfile: Pick<UserEntity, 'isSuperuser' | 'lastName'| 'firstName'| 'email' | 'isStaff' | 'isActive'> = {
    isSuperuser: false, 
    lastName: '', 
    firstName: '', 
    email: '', 
    isStaff: false,
    isActive: false,
}

@Injectable()
export class UserProfileService{
    private readonly logger = new Logger(this.constructor.name)

    constructor(
        @InjectRepository(UserEntity) private readonly userModel: EntityRepository<UserEntity>, 
        readonly passwordService: PasswordService
       ){}

    public async getUserProfile(userId: number): Promise<UserEntity| undefined> {
        this.logger.log( {userId},'getUserProfile',)
        const user = await this.userModel.findOne({id: userId});

        return user ?? undefined;
    }

    public async existsUser(userId: number): Promise<boolean>
    {
        this.logger.log( {userId},'existsUser',)
        const exists = await this.userModel.findOne({id: userId});
        if (exists){
            return true;
        }
        return false;
    }

    public async validateUser(username: string, password: string): Promise<UserEntity | undefined> {
        this.logger.log( {username, password}, 'validateUser');
        const users = await this.userModel.find({$and: [{$or:[{username}, {email: username}]}, {isActive: true}]});

        const user = await users.find(async ({password: oldHash})=> {
            let isValid = false;
            if (oldHash){
                if (oldHash[0] !== '$'){
                    this.logger.log( {user}, 'password is a django one')

                    isValid = await this.passwordService.validateDjango(password, oldHash);
                } else {
                    isValid = await this.passwordService.validate(password, oldHash);
                }
            }
            this.logger.log( {user, isValid}, 'IS valid?');
            return isValid;
        })
        return user;
    }

    public async addUser(username: string, password: string, options: Partial<Omit<UserEntity, 'username' | 'password'>>={}): Promise<UserEntity> {
        this.logger.log( {username, password}, 'addUser');
        const hashedPassword = await this.passwordService.hash(password)
        const user = await this.userModel.create({username, password: hashedPassword, dateJoined: new Date(), ...emptyProfile, ...options,});
        this.logger.log({user}, 'Hey this is the user')
        await this.userModel.persistAndFlush(user);
        return user
    }
}