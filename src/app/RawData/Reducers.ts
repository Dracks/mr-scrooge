import createReducer from "../../utils/CreateReducer";
import generateActions from "../../utils/GenerateActions";

const RAW_FILTER_TAG = "RAW_FILTER_TAG"
export const ACTIONS = generateActions({
    filterTag: RAW_FILTER_TAG
});

export interface IRawDataState {
    tagFilter: any
}
const INITIAL : IRawDataState= {
    tagFilter: null
}
export const rawDataReducers = createReducer(INITIAL, {
    [RAW_FILTER_TAG]: (state, { payload })=>{
        return {...state, tagFilter: payload[0]}
    }
});

export default rawDataReducers;