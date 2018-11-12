import * as React from 'react';
import { PureComponent } from 'react';

import Context, { getObjectResponsive } from './Context';

const throttle = (callback, time) => {
    var timeout;
    return () => {
        if (timeout) {
            clearTimeout(timeout)
        }
        setTimeout(callback,
            time)
    }
}

class Provider extends PureComponent{
    state = getObjectResponsive(window.innerWidth)

    componentDidMount() {
        // update viewportWidth on initial load
        this.saveViewportDimensions();
        // update viewportWidth whenever the viewport is resized
        window.addEventListener('resize', this.saveViewportDimensions);
    }

    componentWillUnmount() {
        // clean up - remove the listener before unmounting the component
        window.removeEventListener('resize', this.saveViewportDimensions);
    }

    // first of all notice lodash.throttle() helper
    // we do not want to run the saveViewportDimensions() hundreads of times
    // from start to finish whenever the viewport is being resized
    saveViewportDimensions = throttle(() => {
        this.setState(getObjectResponsive(window.innerWidth))
    }, this.props.applyViewportChange); // default 250ms

    render(){
        return (
            <Context.Provider value={this.state} >
                {this.props.children}
            </Context.Provider>
        )
    }
}

export default Provider;