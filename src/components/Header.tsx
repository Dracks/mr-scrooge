import { Menu } from 'antd';
import * as React from 'react'
import { Link } from 'react-router-dom';
import ResponsiveNavDefault from '../components/ResponsiveNav';

import ResizableHOC from '../utils/responsive/HOC';

const ResponsiveNav = ResizableHOC(ResponsiveNavDefault);

// { mobileVersion, activeLinkKey, onLinkClick, className }
const contents = (logout) => ()=>{
    return [
            (
            <Menu.Item key="/">
                <Link to='/'>Report</Link>
            </Menu.Item>
            ),(
            <Menu.Item key="/import">
                <Link to='/import'>Import</Link>
            </Menu.Item>
            ),(
            <Menu.Item key="/tag">
                <Link to='/tag'>Tags</Link>
            </Menu.Item>
            ),(
            <Menu.Item key="/raw-data">
                <Link to='/raw-data'>RawData</Link>
            </Menu.Item>
            ),(
            <Menu.Item key='logout'>
                <a onClick={logout}>Logout</a>
            </Menu.Item>
            )]
}
const custom = (l, data)=>()=>{
    return (<Menu theme="dark"
          mode={'horizontal'}
          selectedKeys={[l]}
        >
        <Menu.Item>Mr Scrooge</Menu.Item>
        {data()}
    </Menu>
    );
}

const mobile = (l, data) => ()=>{
    return (
        <Menu theme="dark"
            mode={'horizontal'}
            selectedKeys={[l]}
            >
            <Menu.SubMenu
                title={<span>Menu</span>}>
                {data()}
            </Menu.SubMenu>
        </Menu>
    )
}
export default ({location, logout})=>{
    let l = location.pathname
    const lastPath = l.indexOf("/",2)
    if (lastPath) {
        l = l.substr(0, lastPath)
    }
    const c = contents(logout)
    return (<ResponsiveNav
        menuMarkup={custom(l, c)}
        menuMarkupMobile={mobile(l, c)}
        mobileBreakPoint={767}
     />
     )
};