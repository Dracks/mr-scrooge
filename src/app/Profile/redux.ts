import { fetchAction, jsonHeaders, whenComplete } from 'redux-api-rest';

import { IProfileData } from 'src/types/data';
import { SessionActions } from '../Session/Actions';

export interface IUpdateProfileData extends IProfileData {
    password: string
    'new-password': string
}

export const ProfileActions = {
    update: (data: IUpdateProfileData)=>fetchAction('/api/me/', whenComplete(SessionActions.update) , {
        body: JSON.stringify(data),
        headers: jsonHeaders(),
        method: 'PUT',
    })
}