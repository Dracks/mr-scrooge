import addDispatch from "./AddDispatch";

describe('[AddDispatch]', () => {
    let subject;
    let dispatchMock:jest.Mock;

    beforeEach(()=>{
        dispatchMock = jest.fn();
        subject = addDispatch({
            simple: (arg1)=>({type:arg1})
        })(dispatchMock)
    })
    it('Add dispatch', () => {
        subject.simple("ping");
        expect(dispatchMock).toBeCalledWith({type:"ping"})
    })
  
})
