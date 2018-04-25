import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import Form from './Form';

Enzyme.configure({ adapter: new Adapter() });

describe('[Graphs/Form]', ()=>{
    let wrapper;
    let initial
    beforeEach(()=>{
        initial = {
           component: {
               options: {
                   line: {
                       name: 'L',
                       config: {
                           xaxis: {
                               name: 'x',
                               options: {},
                           },
                           yaxis: {
                               name: '',
                               options: {}
                           }
                       }
                   }
               },
               placeholder: ''
           }
       }
    })

    describe('Actions...', ()=>{
        it('calling the callback', ()=>{
            const mockCallback = jest.fn();
            wrapper = shallow(<Form config={initial} onChange={mockCallback} options={{something:'else'}}/>);
            const instance = wrapper.instance();
    
            instance.changeProperty('component', 'line')
            expect(mockCallback).toHaveBeenCalledWith({component:'line', something:'else'})
        })
    })

    describe('Initialize...', ()=>{
        it('testing initial configuration/Nothing selected', ()=>{
            wrapper = mount(<Form config={initial}/>);
            const instance = wrapper.instance();
            
            expect(wrapper.find('select').length).toEqual(1)
        });

        it('testingconfiguration line selected ', ()=>{
            wrapper = mount(<Form config={initial} options={{component: 'line'}} />);
            const instance = wrapper.instance();
            
            expect(wrapper.find('select').length).toEqual(3)
        });
    });
});