// Import from https://tomas.piestansky.cz/posts/2018/responsive-menu-ant-design/

import React, { Component } from 'react';
import PropTypes from 'prop-types';

// use babel-import-plugin as specified in Ant Design Docs!
// https://ant.design/docs/react/getting-started#Import-on-Demand


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

class ResponsiveNav extends Component {
    state = {
        viewportWidth: 0,
        menuVisible: false,
    };

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

    handleMenuVisibility = (menuVisible) => {
        this.setState({ menuVisible });
    };

    // first of all notice lodash.throttle() helper
    // we do not want to run the saveViewportDimensions() hundreads of times
    // from start to finish whenever the viewport is being resized
    saveViewportDimensions = throttle(() => {
        this.setState({
            viewportWidth: window.innerWidth,
        })
    }, this.props.applyViewportChange); // default 250ms

    render() {
        let MenuComponent = this.props.menuMarkupMobile;
        
        if (this.state.viewportWidth > this.props.mobileBreakPoint) {
            MenuComponent = this.props.menuMarkup; // get the Menu markup, passed as prop
        }
        return (<MenuComponent>
            {this.props.children}
        </MenuComponent>);
    }
}

ResponsiveNav.propTypes = {
    mobileBreakPoint: PropTypes.number,
    applyViewportChange: PropTypes.number,
    menuMarkup: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.object,
    ]),
    menuMarkupMobile: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.object,
    ]),
};

ResponsiveNav.defaultProps = {
    mobileBreakPoint: 575,
    applyViewportChange: 250,
};


export default ResponsiveNav