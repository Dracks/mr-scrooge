
const debugLambda = (lambda) => (...args)=> {
    /* tslint:disable-next-line */
    console.log(args)
    return lambda(...args)
}

const eventHandler=(callback) => {
    return (e)=>{
        e.preventDefault();
        callback(e);
    }
}

const getPathElementName = (location, match) => {
    const urlLength = match.url.length;
    let l = location.pathname
    const lastPath = l.indexOf("/",urlLength+1)
    if (lastPath>=0) {
        l = l.substring(urlLength, lastPath)
    } else {
        l = l.substring(urlLength);
    }
    return l
}

export { eventHandler, getPathElementName, debugLambda };