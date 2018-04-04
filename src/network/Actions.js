const ACTIONS = {
    FETCH: "0-network",
    FETCH_ERROR: "-1-network",
}

export default ACTIONS

export const fetchAction = (url, action, reload=false, request=null)=>{
    return {
        type: ACTIONS.FETCH,
        payload: {
            url: url,
            action: action,
            reload: reload,
            request: request
        }
    }
}

export const fetchError = (data) => {
    return {
        type: ACTIONS.FETCH_ERROR,
        payload: data
    }
}