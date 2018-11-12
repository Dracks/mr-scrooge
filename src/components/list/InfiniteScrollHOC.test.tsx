import * as React from 'react';
import * as Enzyme from 'enzyme';
import { shallow, mount } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';

import InfiniteScrollHOC from './InfiniteScrollHOC';

Enzyme.configure({ adapter: new Adapter() });

describe('[Components/list/InfiniteScrollHOC]', ()=>{
    let Subject, data, dataRecived, loadFnReceived, hasMoreReceived, othersReceived, wrapper;
    let Test = ({data, loadMore, hasMore, ...others})=>{
        dataRecived = data;
        loadFnReceived = loadMore;
        hasMoreReceived = hasMore;
        othersReceived = others;
    }

    beforeEach(()=>{
        Subject = InfiniteScrollHOC(Test, 'data', 5)
        data = []
        for (let i=0; i<30; i++){
            data.push(i);
        }
    })

    const loadPage=(page)=>{
        loadFnReceived(page);
        wrapper.update()
        wrapper.at(0).shallow();
    }

    it('Load with default', ()=>{
        wrapper = shallow(<Subject data={data} dalek="Dr Who"/>)
        wrapper.at(0).shallow();

        expect(dataRecived).toEqual([]);
        expect(loadFnReceived).toBeTruthy()
        expect(othersReceived).toEqual({dalek: "Dr Who"});

        loadPage(1)
        expect(dataRecived.length).toBe(5);
    });

    it('Has more?', ()=>{
        wrapper = shallow(<Subject data={data} />)
        wrapper.at(0).shallow();

        expect(hasMoreReceived).toBe(true);
        loadPage(5)
        expect(hasMoreReceived).toBe(true);
        loadPage(6)
        expect(hasMoreReceived).toBe(false);
    });
});