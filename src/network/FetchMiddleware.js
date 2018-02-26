import Actions, { fetchError } from "./Actions";
import Rest from './Rest';


export default store => next => action => {
    if (action.type === Actions.FETCH){
        store.dispatch({
            type: action.payload.action, 
            payload: {
                isLoading: true
            }
        })
        Rest.get(action.payload.url, action.payload.request)
            .then((r)=>r.json())
            .then((data)=>{
                store.dispatch({
                    type: action.payload.action,
                    payload: {
                        isLoading: false, 
                        data: data
                    }
                })
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