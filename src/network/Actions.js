const ACTIONS = {
    FETCH: "0-network",
    FETCH_ERROR: "-1-network",
}

export default ACTIONS



export const fetchAction = (url, action)=>{
    return {
        type: ACTIONS.FETCH,
        payload: {
            url: url,
            action: action
        }
    }
}

export const fetchError = (data) => {
    return {
        type: ACTIONS.FETCH_ERROR,
        payload: data
    }
}