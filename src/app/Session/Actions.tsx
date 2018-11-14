import { fetchAction } from 'redux-api-rest'

export const FETCH_SESSION_DATA = "SESSION_FETCH_DATA";

export const fetchSession = ()=>{
    return fetchAction('/api/session/', FETCH_SESSION_DATA);
}

export const login = (data)=>{
    return fetchAction('/api/session/', FETCH_SESSION_DATA, {
        body: JSON.stringify(data),
        headers: new Headers({
            'Content-Type': 'application/json'
        }),
        method: "POST",
    });
}

export const logout = () => {
    const action = fetchAction('/api/session/logout', FETCH_SESSION_DATA);
    action.payload.request = {
        method: "DELETE"
    }
    return action
}