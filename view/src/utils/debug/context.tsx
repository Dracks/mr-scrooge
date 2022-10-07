import React from 'react';

import { DEBUG } from '../../constants';

declare global {
    interface Window {
        debug: () => void;
    }
}

const DebugContext = React.createContext<boolean>(DEBUG);

export const DebugProvider: React.FC<{}> = ({ children }) => {
    const [isDebug, setDebug] = React.useState(DEBUG);
    if (window) {
        window.debug = () => {
            setDebug(true);
        };
    }
    return <DebugContext.Provider value={isDebug}>{children}</DebugContext.Provider>;
};

export default DebugContext;
