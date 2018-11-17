import subject from './GenerateActions';

describe('[GenerateActions]', ()=>{
    let Actions;
    beforeEach(()=>{
        Actions = subject({
            ping: "Action-Type"
        })
    })

    it('Action of string', ()=>{
        const test = Actions.ping("Peperoni", "vinagre");
        expect(test.type).toBe('Action-Type')
        expect(test.payload).toEqual(["Peperoni", "vinagre"]);
    })
})