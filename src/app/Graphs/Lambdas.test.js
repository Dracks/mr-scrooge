import { groupLambdas, sortLambdas, getRangeFilter } from './Lambdas';
import moment from 'moment';

describe("[Lambdas]", ()=>{

    describe("Group Lambdas", ()=>{
        var data=[];
        var subject = groupLambdas;

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
            var tags = [
                {id: 1, name: "Dr Who"},
                {id: 2, name: "Farscape"},
                {id: 3, name: "Firefly"}
            ]

            var result = data.map(subject.tags(tags))

            expect(result).toEqual(['Dr Who', 'Farscape', 'Others', 'Dr Who', 'Firefly']);
        });
    });

    describe('Range filter', ()=>{
        var subject
        const check = (date, value)=>{
            expect(subject({date: moment(date).toDate()})).toBe(value)
        }
        it('One month', ()=>{
            var ref = moment("2016-07-01").toDate()
            subject = getRangeFilter(1, ref);
            check("2016-07-31",true);
            check("2016-07-01",true);
            check("2016-06-30",false);
            check("2016-08-01",false);
        })

        it('three month', ()=>{
            var ref = moment("2016-07-01").toDate()
            subject = getRangeFilter(3, ref);
            check("2016-07-31",true);
            check("2016-05-01",true);
            check("2016-04-30",false);
            check("2016-08-01",false);
        })
    });

    describe("Sort Lambdas", ()=>{
        var subject = sortLambdas;
        const values_to_sort = ["pum", "ping", "pam"].map(e=>{return {name:e}})

        it("sort customized with all the same", ()=>{
            var data = ["ping", "pam", "pum"]
            var result = data.sort(subject.tags(values_to_sort))
            expect(result).toEqual(["pum", "ping", "pam"])
        });

        it("sort customized with others", ()=>{
            var data = ["ping", "others", "pam", "pum"]
            var result = data.sort(subject.tags(values_to_sort))
            expect(result).toEqual(["pum", "ping", "pam", "others"])
        });
    })
})