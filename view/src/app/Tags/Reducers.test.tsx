
import {FETCH_TAGS} from './Actions';
import subject from './Reducers';

describe ("[App/Tags/Reducers]", ()=>{

    it("Do nothing", ()=>{
        const obj = {}
        const newState = subject(obj, {type:'DoNothing'});
        expect(newState).toEqual(obj);
    })

    it("Reduce using IDs", ()=>{
        const obj = {}
        const newState = subject(obj, {
            payload:{
                data:[
                    {id:1, name:'peperoni'},
                    {id:30, name:"Dalek"}
                ]
            },
            type:FETCH_TAGS,
        });
        expect(newState[1]).toEqual({id:1, name:'peperoni'})
        expect(newState[30]).toEqual({id:30, name:'Dalek'})
    })

})