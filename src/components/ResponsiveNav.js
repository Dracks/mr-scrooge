// Import from https://tomas.piestansky.cz/posts/2018/responsive-menu-ant-design/

import React from 'react';
import PropTypes from 'prop-types';

// use babel-import-plugin as specified in Ant Design Docs!
// https://ant.design/docs/react/getting-started#Import-on-Demand


const ResponsiveNav =({mobileBreakPoint, menuMarkup, menuMarkupMobile, viewportWidth, children}) => {
    let MenuComponent = menuMarkupMobile;
    
    if (viewportWidth > mobileBreakPoint) {
        MenuComponent = menuMarkup; // get the Menu markup, passed as prop
    }
    return (<MenuComponent>
        {children}
    </MenuComponent>);
}

ResponsiveNav.propTypes = {
    mobileBreakPoint: PropTypes.number.isRequired,
    viewportWidth: PropTypes.number.isRequired,
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
};


export default ResponsiveNav