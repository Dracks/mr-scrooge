import { combineReducers } from "redux";

import fetchReducer from "./network/FetchReducer";
import { FETCH_RAW_DATA } from './app/RawData/Actions';

export default combineReducers({
    showData: fetchReducer(FETCH_RAW_DATA)
});