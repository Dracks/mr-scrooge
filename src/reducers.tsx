import * as moment from 'moment';
import { combineReducers } from "redux";

import { fetchReducer, reducerForData } from 'redux-api-rest';
import graphReducer from './app/Graphs/Reducers';
import { FETCH_IMPORT_KINDS, FETCH_IMPORT_STATUS } from './app/Import/Actions';
import { FETCH_RAW_DATA } from './app/RawData/Actions';
import rawDataView, { IRawDataState } from './app/RawData/Reducers';
import { FETCH_SESSION_DATA } from './app/Session/Actions';
import { FETCH_TAGS } from './app/Tags/Actions';
import { FETCH_FILTER, FETCH_FILTER_TYPES, FILTERS_PARENT }  from './app/Tags/Filters/Actions'
import fetchTagsReducer from "./app/Tags/Reducers";

export interface IStoreType {
    rawDataView: IRawDataState,
    tags: any,
}

export default combineReducers({

    acceptedKinds: fetchReducer(FETCH_IMPORT_KINDS),
    allData: fetchReducer(FETCH_RAW_DATA, (data)=>{
        if (data.data){
            data.data.forEach(element => {
                element.date = moment(element.date).toDate();
            });
        }
        return data;
    }),
    filterTypes: fetchReducer(FETCH_FILTER_TYPES),
    graphs: graphReducer,
    hashTags: fetchTagsReducer,
    importStatus: fetchReducer(FETCH_IMPORT_STATUS),
    rawDataView,
    session: fetchReducer(FETCH_SESSION_DATA),
    tags: fetchReducer(FETCH_TAGS),
    tagsFilters: reducerForData(FILTERS_PARENT, fetchReducer(FETCH_FILTER)),
});