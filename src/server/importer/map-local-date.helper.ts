import { parse } from 'date-fns';

import { FieldsMap } from "./transform.helper";

export class MapLocalDate<T extends number | string> {
    constructor(private readonly mapper: FieldsMap<T>, private readonly dateFormat = 'dd/MM/yyyy') { }

    transform(row: Record<T, unknown>){
        const dateList : T[] = [this.mapper.get('date') as T]
        if (this.mapper.has('dateValue')){
            dateList.push(this.mapper.get('dateValue') as T)
        }

        console.log(row, dateList)

        for (const dateIndex of dateList){
            row[dateIndex] = parse(row[dateIndex] as string, this.dateFormat, new Date());
        }
        console.log(row)
    }
}
