import * as React from 'react';
import { PureComponent } from 'react';

import Context, { getObjectResponsive } from './Context';

const throttle = (callback, time) => {
    let timeout;
    return () => {
        if (timeout) {
            clearTimeout(timeout)
        }
        timeout = setTimeout(callback, time)
    }
}

class Provider extends PureComponent<any>{
    public state = getObjectResponsive(window.innerWidth)

    // first of all notice lodash.throttle() helper
    // we do not want to run the saveViewportDimensions() hundreads of times
    // from start to finish whenever the viewport is being resized
    public saveViewportDimensions = throttle(() => {
        this.setState(getObjectResponsive(window.innerWidth))
    }, this.props.applyViewportChange); // default 250ms

    public componentDidMount() {
        // update viewportWidth on initial load
        this.saveViewportDimensions();
        // update viewportWidth whenever the viewport is resized
        window.addEventListener('resize', this.saveViewportDimensions);
    }

    public componentWillUnmount() {
        // clean up - remove the listener before unmounting the component
        window.removeEventListener('resize', this.saveViewportDimensions);
    }

    public render(){
        return (
            <Context.Provider value={this.state} >
                {this.props.children}
            </Context.Provider>
        )
    }
}

export default Provider;