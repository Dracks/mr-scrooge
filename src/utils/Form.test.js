import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Form from './Form';
import { getSelectOptions, getOption } from './FormHelper';

Enzyme.configure({ adapter: new Adapter() });

describe('[Utils/Form]', ()=>{
    let wrapper;
    let initial
    beforeEach(()=>{
        initial = {
           component: getSelectOptions('', '', {
                line: getOption('Line', {
                    xaxis: getSelectOptions('x', 'x', {}),
                    yaxis: getSelectOptions('y', 'y', {})
                }),
                bar: getOption('Bar'),
            })
       }
    })

    describe('Actions...', ()=>{
        it('calling the callback', ()=>{
            const mockCallback = jest.fn();
            wrapper = shallow(<Form config={initial} onChange={mockCallback} options={{something:'else'}}/>);
            const instance = wrapper.instance();
    
            instance.changeProperty('component', 'line')
            expect(mockCallback).toHaveBeenCalledWith({component:'line', something:'else'})
        });

        it('calling the callback and changing a current value', ()=>{
            const mockCallback = jest.fn();
            wrapper = shallow(<Form config={initial} onChange={mockCallback} options={{component:'bar'}}/>);
            const instance = wrapper.instance();
    
            instance.changeProperty('component', 'line')
            expect(mockCallback).toHaveBeenCalledWith({component:'line'})
        });
    })

    describe('Initialize...', ()=>{
        it('testing initial configuration/Nothing selected', ()=>{
            wrapper = mount(<Form config={initial}/>);
            const instance = wrapper.instance();
            
            expect(wrapper.find('FormSelectOption').length).toEqual(1)
        });

        it('testingconfiguration line selected ', ()=>{
            wrapper = mount(<Form config={initial} options={{component: 'line'}} />);
            const instance = wrapper.instance();
            
            expect(wrapper.find('FormSelectOption').length).toEqual(3)
        });
    });
});