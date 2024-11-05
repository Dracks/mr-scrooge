import React from 'react';

import RestrictedContent from './contents/restricted-content';
import Login from './contents/session/login';
import { useIsAuthenticated } from './utils/session/session-context';

const App: React.FC = () => {
    const isIdentified = useIsAuthenticated();
    if (isIdentified) {
        return <RestrictedContent />;
    } else {
        return <Login />;
    }
};

export default App;
