import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Subject from './WrapGraph';

Enzyme.configure({ adapter: new Adapter() });

const mockClick = {preventDefault:()=>{}};
const changedOptions = {id:1, "Tv show": "Dr Who"};
const defaultOptions = {id: 1}

describe('[Graphs/WrapGraph]', ()=>{
    let wrapper;
    let instance;
    let mockSave;
    let mockDestroy;

    const instantiate = (edit)=>{
        wrapper = shallow(<Subject 
            data={[]} 
            packer={(e)=>e} 
            options={defaultOptions} 
            save={mockSave}
            destroy={mockDestroy}
            edit={edit}/>);
        instance = wrapper.instance();
    }

    const executeAction = (action)=>{
        instantiate(true);
        expect(wrapper.find('Save').length).toEqual(1);
        expect(wrapper.find('Cancel').length).toEqual(1);
        expect(wrapper.find('Delete').length).toEqual(1);
        expect(instance.state.options).toEqual(defaultOptions);

        instance.changeOptions(changedOptions);

        wrapper.find(action).parent().simulate('click', mockClick )
    }

    beforeEach(()=>{
        mockSave = jest.fn();
        mockDestroy = jest.fn();
    });

    describe('Actions', ()=>{

        it('check edit button', ()=>{
            instantiate(false);

            expect(wrapper.find('Edit').length).toEqual(1);
            wrapper.find('Edit').parent().simulate('click', mockClick);
            
            expect(wrapper.find('Save').length).toEqual(1);
            expect(wrapper.find('Cancel').length).toEqual(1);
            expect(wrapper.find('Delete').length).toEqual(1);
        });

        it('check editing cancel', ()=>{
            executeAction('Cancel');

            expect(instance.state.options).toEqual(defaultOptions);
            expect(instance.state.isEdit).toEqual(false);
        });

        it('check editing save', ()=>{
            executeAction('Save');
            
            expect(instance.state.options).toEqual(changedOptions);
            expect(instance.state.isEdit).toEqual(false);
            expect(mockSave).toHaveBeenCalledWith(changedOptions);
        });

        it('check editing delete', ()=>{
            executeAction('Delete');
            
            expect(instance.state.options).toEqual(defaultOptions);
            expect(instance.state.isEdit).toEqual(false);
            expect(mockDestroy).toHaveBeenCalledWith(defaultOptions);
        });
    });
});