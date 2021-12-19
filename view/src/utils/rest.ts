import * as moment from 'moment';
import { NetworkResponse } from 'redux-api-rest';

interface IDate<T> {
    date: T
}

type MapTypes<T> = NetworkResponse<Array<IDate<T>>>

export const mapDate = (data: MapTypes<string>):MapTypes<Date>=>{
    let newData: Array<IDate<Date>> ;
    if (data.data){
        newData = data.data.map(element => ({
            ...element,
            date: moment(element.date).toDate()
        }));
    }
    return { ...data, data: newData};
}

