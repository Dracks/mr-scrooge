import { AnyAction } from "redux";

export interface IActionsInput {
    [name: string]: string
}

type ActionsReturn<T> = {
    [TKey in keyof T]:(...args)=>AnyAction
}
function generateActions<T extends IActionsInput>(actions: T):ActionsReturn<T> {
    const r = {} as any;
    const keys = Object.keys(actions);
    keys.filter(k=>typeof actions[k] === "string")
        .forEach(k => {
            r[k]=(...args)=>({
                payload: args,
                type: actions[k],
            })
        })
    return r;
}

export default generateActions;