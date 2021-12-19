import * as Enzyme from 'enzyme';
import { shallow } from 'enzyme';
import * as Adapter from 'enzyme-adapter-react-16';
import * as React from 'react';

import InfiniteScrollHOC from './InfiniteScrollHOC';

Enzyme.configure({ adapter: new Adapter() });

describe('[Components/list/InfiniteScrollHOC]', ()=>{
    let Subject;
    let data;
    let dataRecived;
    let loadFnReceived;
    let hasMoreReceived;
    let othersReceived;
    let wrapper;

    const Test = ({dataTest, loadMore, hasMore, ...others})=>{
        dataRecived = dataTest;
        loadFnReceived = loadMore;
        hasMoreReceived = hasMore;
        othersReceived = others;
        return <div />
    }

    beforeEach(()=>{
        Subject = InfiniteScrollHOC(Test, 'dataTest', 5)
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
        wrapper = shallow(<Subject dataTest={data} dalek="Dr Who"/>)
        wrapper.at(0).shallow();

        expect(dataRecived).toEqual([]);
        expect(loadFnReceived).toBeTruthy()
        expect(othersReceived).toEqual({dalek: "Dr Who"});

        loadPage(1)
        expect(dataRecived.length).toBe(5);
    });

    it('Has more?', ()=>{
        wrapper = shallow(<Subject dataTest={data} />)
        wrapper.at(0).shallow();

        expect(hasMoreReceived).toBe(true);
        loadPage(5)
        expect(hasMoreReceived).toBe(true);
        loadPage(6)
        expect(hasMoreReceived).toBe(false);
    });
});