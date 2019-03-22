import { NetworkResponse } from 'redux-api-rest';

import { IRawData } from 'src/types/data';
import { mapDate } from 'src/utils/rest';
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

export const rawDataFiltersReducers = createReducer(INITIAL, {
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

const compare = (a: IRawData, b: IRawData)=>{
    if (a.date<b.date){
        return -1
    } else if (a.date>b.date){
        return 1
    } else {
        if ( a.id < b.id){
            return -1
        } else if (a.id > b.id){
            return 1
        } else {
            return 0
        }
    }
}

export const rawDataMergeAndSortReducerCb = (newValues: NetworkResponse<any[]>, status: NetworkResponse<IRawData[]>)=>{
    const oldValues = status && [...status.data] || []
    if (newValues.data){
        const newDataValues = mapDate(newValues) as NetworkResponse<IRawData[]>
        newDataValues.data.forEach((v)=>{
            let statusComparation = -1;
            let index = 0;
            while (statusComparation === -1 && index < oldValues.length){
                statusComparation = compare(v,oldValues[index])
                index++;
            }
            if (statusComparation === 1){
                index--;
                oldValues.splice(index, 0, v)
            } else if (statusComparation === 0) {
                if (newValues.reload){
                    oldValues[index-1]=v;
                }
            } else if (index === oldValues.length){
                oldValues.push(v)
            }
        })
    } else {
        newValues.isLoading = oldValues.length === 0
    }
    return { ...newValues, data: oldValues}
} 

export default rawDataFiltersReducers;