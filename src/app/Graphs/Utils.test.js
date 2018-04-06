import moment from 'moment';
import Utils from './Utils';
import { sortLambdas, groupLambdas, reduceLambdas } from './Lambdas';

describe("[Utils]", ()=>{
    var data;
    beforeEach(()=>{
        data = [
            { date:new Date("2017-07-03"), value: 10 },
            { date:new Date("2017-02-21"), value: 12 },
            { date:new Date("2018-01-01"), value: 1 },
            { date:new Date("2017-07-04"), value: 14 }
        ];
    })
    it("test group by lambda", ()=>{
        var ret = Utils.getGrouppedByLambda(data, (e)=>e.date.getFullYear())
        expect(Object.keys(ret)).toEqual(["2017", "2018"]);
        expect(ret['2017'].length).toBe(3);
    });

    it("test group Month And Days", ()=>{
        var ret = Utils.getGrouppedForGraph(data, groupLambdas.month, groupLambdas.day);
        expect(Object.keys(ret)).toEqual(["2017-07", "2017-02", "2018-01"])
        expect(Object.keys(ret["2017-07"])).toEqual(["3", "4"])
    })

    it("test Sum groups", ()=>{
        var ret = Utils.joinGroups({
            "pepe": [{value: 1}, {value: 10}],
            "hello":{
                "world":[{value: 3}, {value: 60}]
            }
        }, reduceLambdas.sum)
        expect(ret).toEqual({"pepe":11, "hello":{"world": 63}});
    })

    it("test Mount data for chartjs", ()=>{
        var ret = Utils.toChartJs2Axis(
            Utils.joinGroups(
                Utils.getGrouppedForGraph(data, groupLambdas.month, groupLambdas.day),
                reduceLambdas.sum),
                sortLambdas.numbers
            );
        expect(ret.labels).toEqual(["1","3","4","21"]);
        expect(ret.datasets).toEqual([{"data": [0, 10, 14, 0], "label": "2017-07"}, {"data": [0, 0, 0, 12], "label": "2017-02"}, {"data": [1, 0, 0, 0], "label": "2018-01"}]);
    })
})