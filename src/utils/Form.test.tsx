import * as Enzyme from 'enzyme';
import { mount, shallow } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';

import Form from './Form';
import { getOption, getSelectOptions } from './FormHelper';

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

            expect(wrapper.find('FormSelectOption').length).toEqual(1)
        });

        it('testingconfiguration line selected ', ()=>{
            wrapper = mount(<Form config={initial} options={{component: 'line'}} />);

            expect(wrapper.find('FormSelectOption').length).toEqual(3)
        });
    });
});