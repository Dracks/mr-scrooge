class Rest {
    manageFetch (response){
        if (response.ok){
            return response.json()
        } else {
            return Promise.reject({code: response.status, description: response.statusText})
        }
    }

    send(url, data){
        if (!data){
            data={};
        }
        data.credentials = 'same-origin';
        return fetch(url, data)
    }

    sendJson(url, data){
        if (!data.headers){
            data.headers = new Headers();
        }
        data.headers.append('Content-Type', 'application/json')
        return this.send(url, data).then(this.manageFetch)
    }

    get(url){
        return this.send(url, {method:"GET"}).then(this.manageFetch)
    }

    save(url, obj) {
        var method = "POST"
        if (obj.id){
            url = url.replace(":id", obj.id);
            method = "PUT"
        } else {
            url = url.replace(':id/','');
        }
        return this.sendJson(url, {
            body: JSON.stringify(obj),
            method: method,
        }).then(this.manageFetch);
    }

    destroy(url, obj) {
        if (obj.id){
            url = url.replace(':id', obj.id);
        }
        return this.send(url, {
            method: "DELETE",
        }).then((response)=>{
            return response.text()
        });
    }
}

export default new Rest();