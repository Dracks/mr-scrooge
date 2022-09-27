import { CamelCasedProperties } from 'type-fest';

import { components } from '../../generated-models';

export type UserInfo = CamelCasedProperties<components['schemas']['Profile']>;

export interface UserInfoWithPassword extends UserInfo {
    newPassword?: string;
    password: string;
}
