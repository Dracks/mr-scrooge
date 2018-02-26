class Rest {
    get(url, data){
        return fetch(url, data)
    }
}

export default Rest;