import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';

import { UserGroupModel } from '../models/group.model';
import { IUserModel, UserModel } from '../models/user.model';
import { UserGroupRelModel } from '../models/user-group-rel.model';
import { PasswordService } from './password.service';

const emptyProfile: Pick<UserModel, 'isSuperuser' | 'lastName' | 'firstName' | 'email' | 'isStaff' | 'isActive'> = {
    email: '',
    firstName: '',
    isActive: false,
    isStaff: false,
    isSuperuser: false,
    lastName: '',
};

@Injectable()
export class UserProfileService {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectModel(UserModel) private readonly userModel: typeof UserModel,
        @InjectModel(UserGroupModel) private readonly userGroupModel: typeof UserGroupModel,
        @InjectModel(UserGroupRelModel) private readonly userGroupRelModel: typeof UserGroupRelModel,
        readonly passwordService: PasswordService,
    ) {}

    public async getUserProfile(userId: number): Promise<IUserModel | undefined> {
        this.logger.log({ userId }, 'getUserProfile');
        const user = await this.userModel.findOne({ where: { id: userId } });

        return user ?? undefined;
    }

    public async existsUser(userId: number): Promise<boolean> {
        this.logger.log({ userId }, 'existsUser');
        const exists = await this.userModel.findOne({ where: { id: userId } });
        if (exists) {
            return true;
        }
        return false;
    }

    public async validateUser(username: string, password: string): Promise<IUserModel | undefined> {
        this.logger.log({ username, password }, 'validateUser');
        const users = await this.userModel.findAll({
            where: Sequelize.and(Sequelize.or({ username }, { email: username }), { isActive: true }),
        });

        const user = await users.find(async ({ password: oldHash, id }) => {
            let isValid = false;
            if (oldHash) {
                if (oldHash[0] === '$') {
                    isValid = await this.passwordService.validate(password, oldHash);
                } else {
                    this.logger.log({ user }, 'password is a django one');

                    isValid = await this.passwordService.validateDjango(password, oldHash);
                    if (isValid) {
                        await this.setPassword(id, password);
                    }
                }
            }
            this.logger.log({ user, isValid }, 'IS valid?');
            return isValid;
        });
        return user;
    }

    public async changePassword(userId: number, oldPassword: string, newPassword: string): Promise<boolean> {
        const user = await this.userModel.findOne({ where: { id: userId } });
        if (user && (await this.passwordService.validate(oldPassword, user.password))) {
            await this.setPassword(userId, newPassword);
            return true;
        }
        return false;
    }

    private async setPassword(userId: number, password: string) {
        const newHash = await this.passwordService.hash(password);
        await this.userModel.update({ password: newHash }, { where: { id: userId } });
    }

    public async addUser(
        username: string,
        password: string,
        options: Partial<Omit<IUserModel, 'username' | 'password'>> = {},
    ): Promise<IUserModel & { groupId: number }> {
        this.logger.log({ username, password }, 'addUser');
        const hashedPassword = await this.passwordService.hash(password);
        const user = await this.userModel.create({
            dateJoined: new Date(),
            password: hashedPassword,
            username,
            ...emptyProfile,
            ...options,
        });
        this.logger.log({ user }, 'Hey this is the user');
        const group = await this.addGroup(user.dataValues.id, username)
        user.defaultGroupId = group.id;
        await user.save();
        return { ...user.dataValues, groupId: group.id };
    }

    public async addGroup(userId: number, groupName:string){
        const group = await this.userGroupModel.create({
            name: groupName,
            ownerId: userId,
        });

        await this.userGroupRelModel.create({
            userId,
            userGroupId: group.id,
        })

        return group.dataValues;
    }

    public async getGroupsId(userId: number): Promise<number[]> {
        const userGroupRels = await this.userGroupRelModel.findAll({where: {userId}})
        return userGroupRels.map(userGroupRel => userGroupRel.dataValues.userGroupId);
    }
}
