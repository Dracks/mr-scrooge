import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize';

import { UserGroupModel } from '../models/group.model';
import { IUserModel, UserModel } from '../models/user.model';
import { PasswordService } from './password.service';

const SECRET_KEY = '2&_7krtq544)s^9=8i$om!u+9ump*)#-7rcrka9pjld2nnk6p=';

const emptyProfile: Pick<UserModel, 'isSuperuser' | 'lastName' | 'firstName' | 'email' | 'isStaff' | 'isActive'> = {
    isSuperuser: false,
    lastName: '',
    firstName: '',
    email: '',
    isStaff: false,
    isActive: false,
};

@Injectable()
export class UserProfileService {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectModel(UserModel) private readonly userModel: typeof UserModel,
        @InjectModel(UserGroupModel) private readonly userGroupModel: typeof UserGroupModel,
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
                if (oldHash[0] !== '$') {
                    this.logger.log({ user }, 'password is a django one');

                    isValid = await this.passwordService.validateDjango(password, oldHash);
                    if (isValid) {
                        await this.setPassword(id, password);
                    }
                } else {
                    isValid = await this.passwordService.validate(password, oldHash);
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
            username,
            password: hashedPassword,
            dateJoined: new Date(),
            ...emptyProfile,
            ...options,
        });
        this.logger.log({ user }, 'Hey this is the user');
        const group = await this.userGroupModel.create({
            name: username,
            ownerId: user.dataValues.id,
        });
        user.defaultGroupId = group.dataValues.id;
        await user.save();
        return { ...user.dataValues, groupId: group.dataValues.id };
    }
}
