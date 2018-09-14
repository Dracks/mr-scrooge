
export default (actionType, reducer) => (state=[], action) => {
    if (actionType === action.type) {
        let id = action.id
        let newState = state[id]
        return reducer(newState, action.payload)
    }
    return state;
}