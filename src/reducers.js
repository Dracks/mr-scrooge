import { combineReducers } from "redux";
import moment from 'moment';

import fetchReducer from "./network/FetchReducer";
import { FETCH_RAW_DATA } from './app/RawData/Actions';

export default combineReducers({
    allData: fetchReducer(FETCH_RAW_DATA, (data)=>{
        console.log(data);
        if (data.data){
            data.data.forEach(element => {
                element.date = new moment(element.date).toDate();
                console.log(element);
            });
        }
        return data;
    })
});