import { AnyAction } from "redux";

type CallbackFn = (...args: any[])=>AnyAction

export interface IActionsInput {
    [name: string]: string | CallbackFn
}

type ActionsReturn<T> = {
    [TKey in keyof T]:CallbackFn
}
function generateActions<T extends IActionsInput>(actions: T):ActionsReturn<T> {

    const keys = Object.keys(actions);
    let r = keys.filter(k=>typeof actions[k] ==="function")
        .reduce((ac, k) => {
            ac[k] = actions[k]
            return ac;
        }, {} as any)
    r = keys.filter(k=>typeof actions[k] === "string")
        .reduce((ac, k) => {
            ac[k]=(...args)=>({
                payload: args,
                type: actions[k],
            })
            return ac
        }, r)
    return r;
}

export default generateActions;