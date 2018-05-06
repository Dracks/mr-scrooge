import { combineReducers } from "redux";
import moment from 'moment';

import fetchReducer from "./network/FetchReducer";
import { FETCH_SESSION_DATA } from './app/Session/Actions';
import { FETCH_RAW_DATA } from './app/RawData/Actions';
import { FETCH_IMPORT_STATUS, FETCH_IMPORT_KINDS } from './app/Import/Actions';
import { FETCH_TAGS, FETCH_FILTER_TYPES } from './app/Tags/Actions';
import { FETCH_GRAPHS, fetchGraphs } from './app/Graphs/Actions';
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
    graphs: fetchReducer(FETCH_GRAPHS),
    hashTags: fetchTagsReducer,
    filterTypes: fetchReducer(FETCH_FILTER_TYPES),
    session: fetchReducer(FETCH_SESSION_DATA),
});