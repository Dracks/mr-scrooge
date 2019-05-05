import { MultiPropsLoadingHOC } from "redux-api-rest-hocs";

import { Response } from 'redux-api-rest-hocs/lib/Types';


const MultiPropsLoadingMemo = (propsList: string[])=>{
    const callback = MultiPropsLoadingHOC(propsList)
    let memo : Response | null = null;
    let memoLoading : boolean;
    return (state)=>{
        const r = callback(state)
        if (memo && r){
            if (r.meta.isLoading === memoLoading){
                return memo;
            }
        }
        if(r){
            memo = r;
            memoLoading = r.meta.isLoading;
        }
        return r;
    }
}

export default MultiPropsLoadingMemo