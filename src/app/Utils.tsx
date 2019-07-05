
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

const debounce=<T extends []>(callback: (...p:T)=>void, time: number) => {
    let timer: NodeJS.Timeout;
    return (...args: T)=> {
        if (timer){
            clearTimeout(timer)
        }
        timer = setTimeout(()=>callback(...args), time)
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

const shorterString = (pref:number, suf:number)=> {
    const totalSize = pref + suf +1;
    return (str:string) =>{
        if (str.length>totalSize){
            return str.substr(0, pref) + '…' + str.substr(-suf)
        }
        return str;
    }
}

export { eventHandler, getPathElementName, debugLambda, debounce, shorterString };