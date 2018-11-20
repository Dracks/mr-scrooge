import createReducer from "../../utils/redux/CreateReducer";
import generateActions from "../../utils/redux/GenerateActions";

const RAW_FILTER_TAG = "RAW_FILTER_TAG"
const RAW_FILTER_NAME = "RAW_FILTER_NAME"
export const ACTIONS = generateActions({
    filterName: RAW_FILTER_NAME,
    filterTag: RAW_FILTER_TAG,
});

export interface IRawDataState {
    nameFilter: string,
    tagFilter: any,
}
const INITIAL : IRawDataState= {
    nameFilter: undefined,
    tagFilter: undefined,
}
export const rawDataReducers = createReducer(INITIAL, {
    [RAW_FILTER_NAME]: (state, {payload}) => (
        {...state, nameFilter: payload[0]}
    ),
    [RAW_FILTER_TAG]: (state, { payload })=>{
        return {...state, tagFilter: payload[0]}
    }
});

export default rawDataReducers;