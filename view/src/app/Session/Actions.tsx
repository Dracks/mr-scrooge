import { fetchAction, responseReloadAction } from 'redux-api-rest'

import { ILogin } from './types';

export const FETCH_SESSION_DATA = "SESSION_FETCH_DATA";

export const SessionActions = {
    fetch : ()=>fetchAction('/api/session/', FETCH_SESSION_DATA),
    login: (data: ILogin)=>fetchAction('/api/session/', FETCH_SESSION_DATA, {
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        method: "POST",
    }),
    logout :() => {
        const action = fetchAction('/api/session/logout', FETCH_SESSION_DATA);
        action.payload.request = {
            method: "DELETE"
        }
        return action
    },
    update: ()=>fetchAction('/api/session/', responseReloadAction(FETCH_SESSION_DATA)),
}

export default SessionActions