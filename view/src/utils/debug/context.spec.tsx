import { shallow } from 'enzyme';
import React from 'react';

import DebugContext, { DebugProvider } from './context';

const Debug = () => {
    const isDebug = React.useContext(DebugContext);
    return <div>{isDebug ? 'yes' : 'No'}</div>;
};

describe('[DebugContext]', () => {
    const mount = () => {
        const wrapper = shallow(
            <DebugProvider>
                <Debug />
            </DebugProvider>,
        );
        const child = wrapper.childAt(0).shallow();
        return { parent: wrapper, child };
    };

    it('When constants is not debug', () => {
        const { parent, child: subject } = mount();
        expect(subject.text()).toEqual('No');

        window.debug();

        expect(parent.html()).toEqual('<div>yes</div>');
    });
});
