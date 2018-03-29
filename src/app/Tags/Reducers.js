import { FETCH_TAGS } from './Actions'

export default (state=null, action) => {
    if (action.type == FETCH_TAGS && ! action.payload.reload){
        state = {}
        var d = action.payload.data;
        if (d){
            d.forEach(element => {
                state[element.id] = element;
            });
        }
    }
    return state;
}