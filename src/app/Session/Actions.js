import { fetchAction } from '../../network/Actions'

export const FETCH_SESSION_DATA = "SESSION_FETCH_DATA";

export const fetchSession = ()=>{
    return fetchAction('/api/session', FETCH_SESSION_DATA);
}

export const login = (data)=>{
    return fetchAction('/api/session/', FETCH_SESSION_DATA, {
        method: "POST",
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        body: JSON.stringify(data)
    });
}

export const logout = () => {
    var action = fetchAction('/api/session/logout', FETCH_SESSION_DATA);
    action.payload.request = {
        method: "DELETE"
    }
    return action
}