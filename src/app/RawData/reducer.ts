import createReducer from "../../utils/redux/CreateReducer";
import generateActions from "../../utils/redux/GenerateActions";

const RAW_FILTER_KIND = "RAW_FILTER_KIND"
const RAW_FILTER_TAG = "RAW_FILTER_TAG"
const RAW_FILTER_NAME = "RAW_FILTER_NAME"
export const ACTIONS = generateActions({
    filterKind: RAW_FILTER_KIND,
    filterName: RAW_FILTER_NAME,
    filterTag: RAW_FILTER_TAG,
});

export interface IRawDataState {
    nameFilter: string,
    tagFilter: number[],
    kindFilter: string,
}

const INITIAL : IRawDataState= {
    kindFilter: undefined,
    nameFilter: undefined,
    tagFilter: [],
}

export const rawDataReducers = createReducer(INITIAL, {
    [RAW_FILTER_KIND]: (state, {payload})=>(
        {...state, kindFilter: payload[0]}
    ),
    [RAW_FILTER_NAME]: (state, {payload}) => (
        {...state, nameFilter: payload[0]}
    ),
    [RAW_FILTER_TAG]: (state, { payload })=>{
        return {...state, tagFilter: payload[0]}
    },
});

export default rawDataReducers;