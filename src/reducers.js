import { combineReducers } from "redux";

import fetchReducer from "./network/FetchReducer";
import { FETCH_RAW_DATA } from './app/RawData/Actions';
import { FETCH_IMPORT_STATUS } from './app/Import/Actions';

export default combineReducers({
    showData: fetchReducer(FETCH_RAW_DATA),
    importStatus: fetchReducer(FETCH_IMPORT_STATUS)
});