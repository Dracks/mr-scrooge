import { AnyAction } from "redux";

export type PartialReducer<T> = (state: T, action: AnyAction) => T

export interface IHandlersType<T> { 
    [type: string]: PartialReducer<T> 
}

function createReducer<T extends {}, R extends {}>(initialState: T, handlers: R) {
    return function reducer(state: T = initialState, action): T {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action)
        } else {
            return state
        }
    }
}

export default createReducer;