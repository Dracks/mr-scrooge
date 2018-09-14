import { combineReducers } from "redux";
import moment from 'moment';

import fetchReducer from "./network/FetchReducer";
import reducerForData from "./network/ReducerForData";
import { FETCH_SESSION_DATA } from './app/Session/Actions';
import { FETCH_RAW_DATA } from './app/RawData/Actions';
import { FETCH_IMPORT_STATUS, FETCH_IMPORT_KINDS } from './app/Import/Actions';
import { FETCH_TAGS } from './app/Tags/Actions';
import { FILTERS_PARENT, FETCH_FILTER_TYPES, FILTER_FETCH }  from './app/Tags/Filters/Actions'
import graphReducer from './app/Graphs/Reducers';
import fetchTagsReducer from "./app/Tags/Reducers";

export default combineReducers({

    allData: fetchReducer(FETCH_RAW_DATA, (data)=>{
        if (data.data){
            data.data.forEach(element => {
                element.date = new moment(element.date).toDate();
            });
        }
        return data;
    }),
    importStatus: fetchReducer(FETCH_IMPORT_STATUS),
    acceptedKinds: fetchReducer(FETCH_IMPORT_KINDS),
    tags: fetchReducer(FETCH_TAGS),
    tagsFilters: reducerForData(FILTERS_PARENT, fetchReducer(FILTER_FETCH)),
    graphs: graphReducer,
    hashTags: fetchTagsReducer,
    filterTypes: fetchReducer(FETCH_FILTER_TYPES),
    session: fetchReducer(FETCH_SESSION_DATA),
});