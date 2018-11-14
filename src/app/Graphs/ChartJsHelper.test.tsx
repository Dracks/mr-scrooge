import ChartJsHelper from './ChartJsHelper';

describe("[ChartJsHelper]", ()=>{
    let subject

    beforeEach(()=>{
        subject = new ChartJsHelper(
            [
                {
                    data: [1,5,2,3],
                    label: "ping",
                }
            ],
            [ "1", "2", "3", "4" ]
        )
    });

    it('acumValues', ()=>{
        const ret = subject.acumulate().get();
        expect(ret.datasets[0].data).toEqual([1,6,8,11]);
    });

    it('Apply colors', ()=>{
        const ret = subject.applyColors((e)=>{
            return {borderColor:e}
        }).get();
        expect(ret.datasets[0].borderColor).not.toBeNull();
    });
})