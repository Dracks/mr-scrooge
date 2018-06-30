import React from 'react'
import { Link } from 'react-router-dom';
import { Menu } from 'antd';
import ResponsiveNav from '../components/ResponsiveNav';

//{ mobileVersion, activeLinkKey, onLinkClick, className }
const contents = ({logout}) => ()=>{
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
const custom = (l, data, logout)=>()=>{
    return (<Menu
          mode={'horizontal'}
          selectedKeys={[l]}
        >
        <Menu.Item>Mr Scrooge</Menu.Item>
        {data(logout)}
    </Menu>
    );
}

const mobile = (l, data) => ()=>{
    return (
        <Menu
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
    var l = location.pathname
    var last_path = l.indexOf("/",2)
    if (last_path) {
        l = l.substr(0, last_path)
    }
    var c = contents(logout)
    return (<ResponsiveNav
        menuMarkup={custom(l, c)}
        menuMarkupMobile={mobile(l, c)}
        mobileBreakPoint={767}
     />
     )
};