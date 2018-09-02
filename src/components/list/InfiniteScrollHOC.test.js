import React from 'react';
import Enzyme, { shallow, mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

import InfiniteScrollHOC from './InfiniteScrollHOC';

Enzyme.configure({ adapter: new Adapter() });

describe('[Components/list/InfiniteScrollHOC]', ()=>{
    let Subject, data, dataRecived, loadFnReceived, wrapper;
    let Test = ({data, loadMoreFn})=>{
        dataRecived = data;
        loadFnReceived = loadMoreFn;
    }

    beforeEach(()=>{
        Subject = InfiniteScrollHOC(Test, {field:'data', loadName:'loadMoreFn'}, 5)
        data = []
        for (let i=0; i<30; i++){
            data.push(i);
        }
    })

    it('Load with default', ()=>{
        wrapper = shallow(<Subject data={data} />)
        wrapper.at(0).shallow();

        expect(dataRecived).toEqual([]);
        expect(loadFnReceived).toBeTruthy()

        loadFnReceived(1);
        wrapper.update()
        wrapper.at(0).shallow();
        expect(dataRecived.length).toBe(5);
    });
});