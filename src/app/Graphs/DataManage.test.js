
import DataManage from './DataManage';
import { sortLambdas, groupLambdas, reduceLambdas } from './Lambdas';

describe("[DataManage]", ()=>{
    var subject;

    describe(" Raw Data ", ()=>{
        beforeEach(()=>{
            subject = new DataManage([
                { date:new Date("2017-07-03"), value: 10 },
                { date:new Date("2017-02-21"), value: 12 },
                { date:new Date("2018-01-01"), value: 1 },
                { date:new Date("2017-07-04"), value: 14 }
            ]);
        });
    
        it("test group by lambda", ()=>{
            var ret = subject.groupByLambda((e)=>e.date.getFullYear()).get()
            expect(Object.keys(ret)).toEqual(["2017", "2018"]);
            expect(ret['2017'].length).toBe(3);
        });
    
        it("test group Month And Days", ()=>{
            var ret = subject.groupForGraph(groupLambdas.month(), groupLambdas.day()).get();
            expect(Object.keys(ret)).toEqual(["2017-07", "2017-02", "2018-01"])
            expect(Object.keys(ret["2017-07"])).toEqual(["3", "4"])
        });

        it("test Mount data for chartjs", ()=>{
            var ret = subject.groupForGraph(groupLambdas.month(), groupLambdas.day())
                        .reduceGroups(reduceLambdas.sum)
                        .toChartJs2Axis(sortLambdas.day())
                        .get()
            expect(ret.labels).toEqual(["1","3","4","21"]);
            expect(ret.datasets).toEqual([{"data": [0, 10, 14, 0], "label": "2017-07"}, {"data": [0, 0, 0, 12], "label": "2017-02"}, {"data": [1, 0, 0, 0], "label": "2018-01"}]);
        })
    });

    describe("Grouped data", ()=>{
        beforeEach(()=>{
            subject = new DataManage({
                "pepe": [{value: 1}, {value: 10}],
                "hello":{
                    "world":[{value: 3}, {value: 60}]
                }
            });
        });

        it("test sum groups", ()=>{
            var ret = subject.reduceGroups(reduceLambdas.sum).get();
            expect(ret).toEqual({"pepe":11, "hello":{"world": 63}});
        })
    });
});