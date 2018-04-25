import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Form from './Form';

Enzyme.configure({ adapter: new Adapter() });

describe('[Graphs/Form]', ()=>{
    let wrapper;

    describe('Actions...', ()=>{
        
    })

    describe('Initialize...', ()=>{
        it('testing initial configuration/Nothing selected', ()=>{
            wrapper = mount(<Form />);
            const instance = wrapper.instance();
            
            expect(wrapper.find('select').length).toEqual(1)
        });

        fit('testingconfiguration line selected ', ()=>{
            wrapper = mount(<Form options={{component: 'line'}} />);
            const instance = wrapper.instance();
            
            expect(wrapper.find('select').length).toEqual(3)
        });
    });
});