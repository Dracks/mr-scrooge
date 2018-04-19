import { groupLambdas, sortLambdas } from './Lambdas';

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

    describe("Sort Lambdas", ()=>{
        var subject = sortLambdas;

        it("sort customized with all the same", ()=>{
            var data = ["ping", "pam", "pum"]
            var result = data.sort(subject.tags(["pum", "ping", "pam"]))
            expect(result).toEqual(["pum", "ping", "pam"])
        });
        it("sort customized with others", ()=>{
            var data = ["ping", "others", "pam", "pum"]
            var result = data.sort(subject.tags(["pum", "ping", "pam"]))
            expect(result).toEqual(["pum", "ping", "pam", "others"])
        });
    })
})