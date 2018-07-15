
const eventHandler=(callback) => {
    return (e)=>{
        e.preventDefault();
        callback(e);
    }
}

const getPathElementName = (location, match) => {
    var urlLength = match.url.length;
    var l = location.pathname
    var last_path = l.indexOf("/",urlLength+1)
    if (last_path>=0) {
        l = l.substring(urlLength, last_path)
    } else {
        l = l.substring(urlLength);
    }
    return l
}

export { eventHandler, getPathElementName };