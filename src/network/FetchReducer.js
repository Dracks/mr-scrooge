export default actionType => (state=null, action) => {
    if (action.type === actionType){
        if (!action.payload.reload){
            return Object.assign({}, state, action.payload);
        }
    }
    return state;
}