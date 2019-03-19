import { connectRouter } from 'connected-react-router'
import { combineReducers } from "redux";

import { fetchReducer, NetworkResponse, reducerForData } from 'redux-api-rest';
import graphReducer from './app/Graphs/Reducers';
import { FETCH_IMPORT_KINDS, FETCH_IMPORT_STATUS } from './app/Import/Actions';
import { FETCH_RAW_DATA } from './app/RawData/Actions';
import rawDataView, { IRawDataState, rawDataMergeAndSortReducerCb } from './app/RawData/reducer';
import { FETCH_SESSION_DATA } from './app/Session/Actions';
import { ISession } from './app/Session/types';
import { FETCH_TAGS } from './app/Tags/Actions';
import { FETCH_FILTER, FETCH_FILTER_TYPES, FILTERS_PARENT }  from './app/Tags/Filters/Actions'
import fetchTagsReducer from "./app/Tags/Reducers";
import { IFileKind, IRawData, ITag } from './types/data';
import { mapDate } from './utils/rest';

export interface IStoreType {
    allData: NetworkResponse<IRawData[]>
    importFileKinds: IFileKind[]
    rawDataView: IRawDataState
    session: NetworkResponse<ISession>
    tags: NetworkResponse<ITag[]>
}

const mapKinds = (obj: NetworkResponse<any[]>):NetworkResponse<IFileKind[]>=>{
    if (obj.data){
        const data = obj.data
        obj.data = Object.keys(data)
            .map((e)=>({ 
                    key: e,
                    regexp : new RegExp(data[e])
            }))
    }
    return obj
}


export default (history)=>combineReducers({
    allData: fetchReducer(FETCH_RAW_DATA, rawDataMergeAndSortReducerCb),
    filterTypes: fetchReducer(FETCH_FILTER_TYPES),
    graphs: graphReducer,
    hashTags: fetchTagsReducer,
    importFileKinds: fetchReducer(FETCH_IMPORT_KINDS, mapKinds),
    importStatus: fetchReducer(FETCH_IMPORT_STATUS, mapDate),
    rawDataView,
    router: connectRouter(history), 
    session: fetchReducer(FETCH_SESSION_DATA),
    tags: fetchReducer(FETCH_TAGS),
    tagsFilters: reducerForData(FILTERS_PARENT, fetchReducer(FETCH_FILTER)),
});