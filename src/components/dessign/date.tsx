import * as moment from 'moment';
import * as React from 'react';

interface IFullDateProps {
    date: Date
}
const FullDate = ({date}: IFullDateProps)=>(
    <span>{moment(date).format("LLL")}</span>
)

export { 
    FullDate
}