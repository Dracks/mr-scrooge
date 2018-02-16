export default actionType => (state=null, action) => {
    if (action.type === actionType){
        return Object.assign({}, state, action.payload);
    }
    return state;
}