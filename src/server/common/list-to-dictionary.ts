export const listToDictionary = <T extends object, K extends keyof T, R extends string|number>(list: T[], key: K):Record<R,T>=>{
    const ret = {} as Record<R,T>;
    list.forEach(element => {
        const index = element[key] as R
        ret[index]=element
    });
    return ret;
}

export const listToDictionaryList =<T extends object, K extends keyof T, R extends string|number>(list: T[], key: K):Record<R,T[]>=>{
    const ret = {} as Record<R,T[]>;
    list.forEach(element => {
        const index = element[key] as R
        let currList = ret[index]
        if (!currList) {
            currList = [];
            ret[index] = currList
        }
        currList.push(element)
    });
    return ret;
}