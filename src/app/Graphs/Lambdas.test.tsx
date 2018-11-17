import * as moment from 'moment';
import { getRangeFilter, groupLambdas, sortLambdas } from './Lambdas';

describe("[Lambdas]", ()=>{

    describe("Group Lambdas", ()=>{
        let data=[];
        const subject = groupLambdas;

        beforeEach(()=>{
            data = [
                {tags:[1,32], name:'Daleks'},
                {tags:[12,2], name:'Pace keepers'},
                {tags:[43], name:"Cylons"},
                {tags:[1,2,3], name:'Prota'},
                {tags:[3], name:"Reapers"},
            ]
        });

        it("Group by tags", ()=>{
            const tags = [
                {id: 1, name: "Dr Who"},
                {id: 2, name: "Farscape"},
                {id: 3, name: "Firefly"}
            ]

            const result = data.map(subject.tags(tags))

            expect(result).toEqual(['Dr Who', 'Farscape', 'Others', 'Dr Who', 'Firefly']);
        });
    });

    describe('Range filter', ()=>{
        let subject
        const check = (date, value)=>{
            expect(subject({date: moment(date).toDate()})).toBe(value)
        }
        it('One month', ()=>{
            const ref = moment("2016-07-01").toDate()
            subject = getRangeFilter(1, ref);
            check("2016-07-31",true);
            check("2016-07-01",true);
            check("2016-06-30",false);
            check("2016-08-01",false);
        })

        it('three month', ()=>{
            const ref = moment("2016-07-01").toDate()
            subject = getRangeFilter(3, ref);
            check("2016-07-31",true);
            check("2016-05-01",true);
            check("2016-04-30",false);
            check("2016-08-01",false);
        })
    });

    describe("Sort Lambdas", ()=>{
        const subject = sortLambdas;
        const valuesToSort = ["pum", "ping", "pam"].map(e=>({name:e}))

        it("sort customized with all the same", ()=>{
            const data = ["ping", "pam", "pum"]
            const result = data.sort(subject.tags(valuesToSort))
            expect(result).toEqual(["pum", "ping", "pam"])
        });

        it("sort customized with others", ()=>{
            const data = ["ping", "others", "pam", "pum"]
            const result = data.sort(subject.tags(valuesToSort))
            expect(result).toEqual(["pum", "ping", "pam", "others"])
        });
    })
})