
export default (actionType, reducer) => (state=[], action) => {
    if (actionType === action.type) {
        let id = action.id
        let subState = state[id]
        let newState = reducer(subState, action.payload)
        if (newState !== subState){
            let r = [...state]
            r[id] = newState
            return r;
        }
    }
    return state;
}