
const eventHandler=(callback) => {
    return (e)=>{
        e.preventDefault();
        callback(e);
    }
}

const manageFetch = (response)=>{
    if (response.ok){
        return response.json()
    } else {
        //console.log(response);
        return Promise.reject({code: response.status, description: response.statusText})
    }
}

const saveElement = (url, obj) => {
    var method = "POST"
    if (obj.id){
        url = url.replace(":id", obj.id);
        method = "PUT"
    }
    return fetch(url, {
        body: JSON.stringify(obj),
        method: method,
        headers: new Headers({
            'Content-Type': 'application/json'
          })
    }).then(manageFetch)
}

export { eventHandler, saveElement, manageFetch };