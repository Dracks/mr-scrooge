import format from "date-fns/format"
import { MapLocalDate } from "./map-local-date.helper"
import { FieldsMap } from "./transform.helper"


describe(`[${MapLocalDate.name}]`, ()=>{
    let subject : MapLocalDate<string>
    let mapper: FieldsMap<string>
    describe('default format date', ()=>{
        beforeEach(()=>{
            mapper = new Map([
                ["movementName", "movement"],
                ["date", "date"],
                ["dateValue", "date2"],
            ])
            subject = new MapLocalDate(mapper)
        })
        it('Valid default date', ()=>{
            const data : Record<string, unknown> = {
                "movement": "",
                "date": "01/02/2024"
            }

            subject.transform(data)

            expect(data.date).toEqual(expect.any(Date))
            expect(format(data.date as Date, "yyyy-MM-dd")).toEqual("2024-02-01")
        })
    })
})
