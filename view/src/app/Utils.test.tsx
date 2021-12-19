import { getPathElementName } from './Utils';
const mockMatch=(data)=>({
    url:data
})

const mockLocation = (data)=>({
    pathname: data
})
describe('[Utils]', ()=>{
    let subject;
    describe('Get Path Element Name', ()=>{
        beforeEach(()=>{
            subject = getPathElementName
        })
        it ('root element', ()=>{
            const data = subject(mockLocation('/Dr Who'), mockMatch('/'));
            expect(data).toEqual('Dr Who')
        })
    })
})