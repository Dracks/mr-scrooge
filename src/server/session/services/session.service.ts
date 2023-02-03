import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import shortUuid from 'short-uuid';

import { CustomError, ensureOrThrow } from '../../core/errors/base-error';
import { ISessionModel, SessionModel } from '../models/session.model';
import { IUserModel, UserModel } from '../models/user.model';

@Injectable()
export class SessionService {
    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectModel(SessionModel) private readonly sessionRepository: typeof SessionModel,
        @InjectModel(UserModel) private readonly userRepository: typeof UserModel,
    ) {}

    public async newSession(user: IUserModel): Promise<ISessionModel> {
        const sessionId = shortUuid.generate();

        // const userModel = ensureOrThrow(await this.userRepository.findByPk(user.id), new Error('Session cannot be created because of an invalid user id'))

        const session = await this.sessionRepository.create({
            sessionId,
            // user: userModel,
            userId: user.id,
            createdAt: new Date(),
            lastActivity: new Date(),
        });
        return session;
    }

    public async getSession(sessionId: string): Promise<ISessionModel | undefined> {
        const session = await this.sessionRepository.findOne({ where: { sessionId } });
        if (session) {
            /*
             * console.log(await session.$get('user'))
             * const user = ensureOrThrow(await session.$get('user'), new CustomError('SE0001', 'user id in session is invalid', {}))
             */
            return session.dataValues;
        }
    }

    public async dropSession(sessionId: string): Promise<void> {
        await this.sessionRepository.destroy({ where: { sessionId } });
    }
}
