
export default (actionType, reducer) => (state=null, action) => {
    if (actionType === action.type) {
        let id = action.id
        let newState = state.data[id]
        return reducer(newState, action.payload)
    }
    return state;
}