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

const manageResponse = (response)=> {
    if (response.ok){
        return response.json()
    } else {
        return Promise.reject({code: response.status, description: response.statusText})
    }
}

export const whenComplete = (callback) => (isLoading, data) =>{
    if (!isLoading && data){
        return callback()
    }
}

export const responseReloadAction = (action) => {
    return (isLoading, data) => {
        return {
            type: action,
            payload: {
                isLoading: isLoading,
                reload: true,
                data: data,
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
                reload: false,
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
            request,
            manageResponse,
        }
    }
}

export const saveAction = (url, action, body)=>{
    var method = "POST"
    if (body.id){
        url = url.replace(":id", body.id);
        method = "PUT"
    } else {
        url = url.replace(':id/','');
    }
    return fetchAction(url, action, {
        body: JSON.stringify(body),
        method: method,
        headers: new jsonHeaders()
    })
}

export const deleteAction = (url, action, body)=>{
    var method = "DELETE"
    url = url.replace(":id", body.id);
    let actionObject =  fetchAction(url, action, {
        method: method,
        headers: new jsonHeaders()
    });
    actionObject.payload.manageResponse = (e)=>e;
    return actionObject;
}

export const fetchError = (data) => {
    return {
        type: ACTIONS.FETCH_ERROR,
        payload: data
    }
}