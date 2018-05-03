import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Subject from './WrapGraph';

Enzyme.configure({ adapter: new Adapter() });

const mockClick = {preventDefault:()=>{}};
const changedOptions = {"Tv show": "Dr Who"};

describe('[Graphs/WrapGraph]', ()=>{
    let wrapper;
    let instance;
    let mockSave;
    let mockDestroy;

    const instantiate = (edit)=>{
        wrapper = shallow(<Subject 
            data={[]} 
            packer={(e)=>e} 
            options={{}} 
            save={mockSave}
            destroy={mockDestroy}
            edit={edit}/>);
        instance = wrapper.instance();
    }

    const executeAction = (action)=>{
        instantiate(true);
        expect(wrapper.find('a').length).toEqual(3);
        expect(instance.state.options).toEqual({});

        instance.changeOptions(changedOptions);

        wrapper.find('a').filterWhere((a)=>a.contains(action)).simulate('click', mockClick )
    }

    beforeEach(()=>{
        mockSave = jest.fn();
        mockDestroy = jest.fn();
    });

    describe('Actions', ()=>{
        

        it('check edit button', ()=>{
            instantiate(false);
            expect(wrapper.find('a').length).toEqual(1);
            wrapper.find('a').simulate('click', mockClick);
            expect(wrapper.find('a').length).toEqual(3);
        });

        it('check editing cancel', ()=>{
            executeAction('cancel');

            expect(instance.state.options).toEqual({});
            expect(instance.state.isEdit).toEqual(false);
        });

        it('check editing save', ()=>{
            executeAction('save');
            
            expect(instance.state.options).toEqual(changedOptions);
            expect(instance.state.isEdit).toEqual(false);
            expect(mockSave).toHaveBeenCalledWith({"Tv show": "Dr Who"});
        });

        it('check editing save', ()=>{
            executeAction('delete');
            
            expect(instance.state.options).toEqual({});
            expect(instance.state.isEdit).toEqual(false);
            expect(mockDestroy).toHaveBeenCalledWith({});
        });
    });
});