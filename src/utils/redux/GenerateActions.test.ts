import subject from './GenerateActions';

describe('[GenerateActions]', ()=>{
    let Actions;
    beforeEach(()=>{
        Actions = subject({
            callback: ()=>({type:"Callback"}),
            ping: "Action-Type",
        })
    })

    it('Action of string', ()=>{
        const test = Actions.ping("Peperoni", "vinagre");
        expect(test.type).toBe('Action-Type')
        expect(test.payload).toEqual(["Peperoni", "vinagre"]);
    })

    it ('Action of callback', ()=>{
        const test = Actions.callback();
        expect(test.type).toBe('Callback');
    })
})