const ACTIONS = {
    FETCH: "0-network",
    FETCH_ERROR: "-1-network",
}

export default ACTIONS

export const jsonHeaders = ()=>{
    var headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return headers;
}

export const responseReloadAction = (action) => {
    return (isLoading, data) => {
        return {
            type: action,
            payload: {
                isLoading: isLoading,
                reload: true,
                data: data
            }
        }
    }
}

export const responseAction = (action)=>{
    return (isLoading, data)=>{
        return {
            type: action,
            payload: {
                isLoading: isLoading, 
                data: data,
                reload: false
            }
        }
    }
}

export const fetchAction = (url, action, request=null)=>{
    var actions_list = action;
    if (!Array.isArray(actions_list)){
        actions_list = [action];
    }
    actions_list = actions_list.map(e=>{
        if (typeof e === "string"){
            return responseAction(e)
        } else {
            return e;
        }
    })
    
    return {
        type: ACTIONS.FETCH,
        payload: {
            url: url,
            actions_list: actions_list,
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