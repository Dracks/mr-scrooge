import ACTIONS from 'redux-api-rest/lib/Actions';

const retardFetchMiddleware = (store) => (next) => (action) => {
    if (action.type === ACTIONS.FETCH){
        setTimeout(()=>next(action), 1000);
    } else {
        next(action)
    }
}

export default retardFetchMiddleware;