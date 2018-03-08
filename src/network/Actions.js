const ACTIONS = {
    FETCH: "0-network",
    FETCH_ERROR: "-1-network",
}

export default ACTIONS



export const fetchAction = (url, action, reload)=>{
    return {
        type: ACTIONS.FETCH,
        payload: {
            url: url,
            action: action,
            reload: reload || false
        }
    }
}

export const fetchError = (data) => {
    return {
        type: ACTIONS.FETCH_ERROR,
        payload: data
    }
}