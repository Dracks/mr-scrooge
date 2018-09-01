import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { Select, Input } from 'antd';

import { getInputOptions, getSelectOptions, getMultiSelectOptions } from './FormHelper';

Enzyme.configure({ adapter: new Adapter() });

describe('[Utils/FormHelper]', ()=>{
    let wrapper;
    describe('Input text', ()=>{
        let Subject;
        beforeEach(()=>{
            Subject = getInputOptions().input;
        });

        it('Input text file', ()=>{
            const mockCallback = jest.fn();
            wrapper = mount(<Subject callback={mockCallback} value={'initial'} />)
            //const instance = wrapper.instance();
            
            console.log(wrapper.find(Input));
            const input = mount(wrapper.find(Input).getElement());
            console.log(input.instance());

            expect(input.instance().input.value).toBe('initial')
            input.simulate('change', {target: {value: 'abc'}});
            input.simulate('blur');
            expect(mockCallback).toHaveBeenCalledWith('abc');
        });

    });
    describe('Select Option', ()=>{
        let Subject;
        let options;
        beforeEach(()=>{
            Subject = getSelectOptions().input;
            options = [1,2,3].map((e)=>{return {key:e, value:e}})
        });

        fit('Change Selection', ()=>{
            const mockCallback = jest.fn();
            console.log(Subject);
            wrapper = shallow(<Subject 
                callback={mockCallback} 
                options={options}
                />);
            const instance = wrapper.instance();

            expect(wrapper.find('label').length).toEqual(1);
            console.log(wrapper.find('Select'));
            expect(wrapper.find(Select).length).toEqual(1);
            wrapper.find(Select).simulate('change', {target: { value : 2}})
            expect(mockCallback).toHaveBeenCalledWith(2)
        });
    });

    describe('Multi Select Option', ()=>{
        let Subject;
        let options;
        beforeEach(()=>{
            Subject = getMultiSelectOptions().input;
            options = [1,2,3].map((e)=>{return {key:e, value:"option:"+e}})
        });

        it('Change Selection', ()=>{
            const mockCallback = jest.fn();
            wrapper = mount(<Subject callback={mockCallback} options={options} value={[1]}/>);
            const instance = wrapper.instance();

            expect(wrapper.find('label').length).toEqual(1);
            expect(wrapper.find('select').length).toEqual(1);
            expect(wrapper.find('.row').length).toEqual(1);
            expect(wrapper.find('.row').text()).toContain('option:1');
            expect(wrapper.find('.row').last().text()).not.toContain('option:2');

            wrapper.find('select').simulate('change', {target: { value : [2]}});
            expect(mockCallback).toHaveBeenCalledWith([1,2])
            expect(wrapper.find('.row').length).toEqual(2);
            expect(wrapper.find('.row').last().text()).toContain('option:2');
        });

        it('Remove option', ()=>{
            const mockCallback = jest.fn();
            wrapper = mount(<Subject callback={mockCallback} options={options} value={[1,2,3]}/>);
            const instance = wrapper.instance();
            expect(wrapper.find('.row').length).toEqual(3);
            
            wrapper.find('.row').at(1).find('.close').simulate('click');
            expect(mockCallback).toHaveBeenCalledWith([1,3])
            expect(wrapper.find('.row').length).toEqual(2);
            
        });
    });
})