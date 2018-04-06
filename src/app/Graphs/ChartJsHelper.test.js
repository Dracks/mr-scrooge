import ChartJsHelper from './ChartJsHelper';

describe("[ChartJsHelper]", ()=>{
    var subject

    beforeEach(()=>{
        subject = new ChartJsHelper(
            [
                {
                    label: "ping",
                    data: [1,5,2,3]
                }
            ], 
            [ "1", "2", "3", "4" ]
        )
    });

    it('acumValues', ()=>{
        var ret = subject.acumulate().get();
        expect(ret.datasets[0].data).toEqual([1,6,8,11]);
    });

    it('Apply colors', ()=>{
        var ret = subject.applyColors((e)=>{
            return {borderColor:e}
        }).get();
        expect(ret.datasets[0].borderColor).not.toBeNull();
    });
})