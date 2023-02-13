import { CamelCasedProperties } from 'type-fest';

import { components } from '../../generated-models';

export interface LoginParams {
    password: string;
    user: string;
}

export type UserSession = CamelCasedProperties<components['schemas']['UserSession']>;

export type GetSessionResponse = UserSession | Pick<UserSession, 'isAuthenticated'>;
