class Rest {
    manageFetch (response){
        if (response.ok){
            return response.json()
        } else {
            //console.log(response);
            return Promise.reject({code: response.status, description: response.statusText})
        }
    }

    get(url, data){
        return fetch(url, data).then(this.manageFetch)
    }

    save(url, obj) {
        var method = "POST"
        if (obj.id){
            url = url.replace(":id", obj.id);
            method = "PUT"
        } else {
            url = url.replace(':id/','');
        }
        return fetch(url, {
            body: JSON.stringify(obj),
            method: method,
            headers: new Headers({
                'Content-Type': 'application/json'
              })
        }).then(this.manageFetch)
    }
}

export default new Rest();