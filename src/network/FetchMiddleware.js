import Actions, { fetchError } from "./Actions";
import Rest from './Rest';

const getActions = (actionsList, isLoading, data) => {
    return actionsList.map(e=>{
        if (typeof e === "function"){
            return e(isLoading, data);
        }
        return e;
    }).filter(e=>e)
}

export default store => next => action => {
    if (action.type === Actions.FETCH){
        getActions(action.payload.actions_list, true)
            .forEach((e)=>{
                console.log(e);
                store.dispatch(e)
            })

        Rest.send(action.payload.url, action.payload.request)
            .then(Rest.manageFetch)
            .then((data)=>{
                getActions(action.payload.actions_list, false, data)
                    .forEach(store.dispatch)
            },
            (error) => {
                store.dispatch(fetchError({
                    url: action.payload.url,
                    error: error
                }))
            }
        )
    } else {
       return next(action)
    }
}