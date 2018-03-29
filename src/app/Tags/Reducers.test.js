
import {FETCH_TAGS} from './Actions';
import subject from './Reducers';

describe ("[App/Tags/Reducers]", ()=>{
    
    it("Do nothing", ()=>{
        var obj = {}
        var newState = subject(obj, {type:'DoNothing'});
        expect(newState).toEqual(obj);
    })

    it("Reduce using IDs", ()=>{
        var obj = {}
        var newState = subject(obj, {
            type:FETCH_TAGS, 
            payload:{
                data:[
                    {id:1, name:'peperoni'}, 
                    {id:30, name:"Dalek"}
                ]
            }
        });
        expect(newState[1]).toEqual({id:1, name:'peperoni'})
        expect(newState[30]).toEqual({id:30, name:'Dalek'})
    })
    
})