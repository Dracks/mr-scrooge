import { getPathElementName } from './Utils';

describe('[Utils]', ()=>{
    let subject;
    describe('Get Path Element Name', ()=>{
        beforeEach(()=>{
            subject = getPathElementName
        })
        it ('root element', ()=>{
            data = subject({url:'/'}, {basepath: '/Dr Who'})
            expect(data).toEqual('Dr Who')
        })
    })
})