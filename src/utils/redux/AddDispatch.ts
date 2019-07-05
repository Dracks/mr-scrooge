import { Action, Dispatch } from 'redux';

const addDispatch =<T extends {}>(obj: T)=>(dispatch:Dispatch<Action>):T=>{
    return Object.keys(obj).reduce((ac, k)=>{
        ac[k] = (...args)=>{
            const action = obj[k](...args)
            dispatch(action);
            return action;
        }
        return ac;
    }, {}) as T
}

export const addDispatchWithProps = <T extends {}, P extends {}>(call:(p:P)=>T)=>(dispatch: Dispatch<Action>, state: P): T => {
    return addDispatch(call(state))(dispatch)
}

export default addDispatch