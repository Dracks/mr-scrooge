import React from 'react';

import Context from './Context';

// This function takes a component...
const withWindowSize = (Component) => {
    // ...and returns another component...
    return (props) => {
        // ... and renders the wrapped component with the context theme!
        // Notice that we pass through any additional props as well
        return (
            <Context.Consumer>
                {data => <Component {...props} {...data} />}
            </Context.Consumer>
        );
    };
}

export default withWindowSize;