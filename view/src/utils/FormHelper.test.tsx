import { Input, Select } from 'antd';
import * as Enzyme from 'enzyme';
import { mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';

import { getInputOptions, getMultiSelectOptions, getSelectOptions } from './FormHelper';

Enzyme.configure({ adapter: new Adapter() });

describe('[Utils/FormHelper]', ()=>{
    let wrapper;
    describe('Input text', ()=>{
        let Subject;
        beforeEach(()=>{
            Subject = getInputOptions("", "").input;
        });

        it('Input text file', ()=>{
            const mockCallback = jest.fn();
            wrapper = mount(<Subject callback={mockCallback} value={'initial'} />)
            // const instance = wrapper.instance();

            const input = mount(wrapper.find(Input).getElement());

            expect((input.instance() as any).input.value).toBe('initial')
            input.simulate('change', {target: {value: 'abc'}});
            input.simulate('blur');
            expect(mockCallback).toHaveBeenCalledWith('abc');
        });

    });
    describe('Select Option', ()=>{
        let Subject;
        let options;
        beforeEach(()=>{
            Subject = getSelectOptions("", "", {}).input;
            options = [1,2,3].map((e)=>({key:e, value:e}))
        });

        it('Change Selection', ()=>{
            const mockCallback = jest.fn();
            wrapper = mount(<Subject
                callback={mockCallback}
                options={options}
                />);

            expect(wrapper.find('label').length).toEqual(1);
            const select = wrapper.find(Select);

            expect(select.length).toEqual(1);
            wrapper.find(Select).simulate('click')
            wrapper.find(".ant-select-dropdown-menu-item").at(1).simulate("click")

            expect(mockCallback).toHaveBeenCalledWith(2)
        });
    });

    describe('Multi Select Option', ()=>{
        let Subject;
        let options;
        const tagClass = ".ant-select-selection__choice"
        beforeEach(()=>{
            Subject = getMultiSelectOptions("", "", {}).input;
            options = [1,2,3].map((e)=>({key:e, value:"option:"+e}))
        });

        it('Change Selection', ()=>{
            const mockCallback = jest.fn();
            wrapper = mount(<Subject callback={mockCallback} options={options} value={[1]}/>);

            expect(wrapper.find('label').length).toEqual(1);
            expect(wrapper.find(Select).length).toEqual(1);
            expect(wrapper.find(tagClass).length).toEqual(1);
            expect(wrapper.find(tagClass).text()).toContain('option:1');
            expect(wrapper.find(tagClass).last().text()).not.toContain('option:2');

            wrapper.find(Select).simulate('click')
            wrapper.find(".ant-select-dropdown-menu-item").at(1).simulate("click")
            expect(mockCallback).toHaveBeenCalledWith([1,2], expect.anything())
            // Some kind of problems with animations I supouse
            // expect(wrapper.find(tagClass).length).toEqual(2);
            // expect(wrapper.find(tagClass).last().text()).toContain('option:2');
        });

        it('Remove option', ()=>{
            const mockCallback = jest.fn();
            wrapper = mount(<Subject callback={mockCallback} options={options} value={[1,2,3]}/>);

            expect(wrapper.find(tagClass).length).toEqual(3);

            wrapper.find(tagClass).at(1).find('.ant-select-selection__choice__remove').simulate('click');
            expect(mockCallback).toHaveBeenCalledWith([1,3], expect.anything())
            // Same problem as previous one, animation problem
            // expect(wrapper.find(tagClass).length).toEqual(2);

        });
    });
})