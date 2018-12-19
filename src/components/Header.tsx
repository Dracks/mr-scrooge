import { Menu } from 'antd';
import * as React from 'react'
import { Link } from 'react-router-dom';
import ResponsiveNavDefault from '../components/ResponsiveNav';

import { ISession } from 'src/app/Session/types';
import ResizableHOC from '../utils/responsive/HOC';
import { Dropdown } from './dessign/icons';

const ResponsiveNav = ResizableHOC(ResponsiveNavDefault);

interface IHeaderProps {
    location: any,
    logout: ()=>void
    session: ISession
}

// { mobileVersion, activeLinkKey, onLinkClick, className }
const Contents = ()=>[
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
    )
]

const profile = (logout)=>[
    (
        <Menu.Item key='/profile'>
            <Link to='/profile'>Edit profile</Link>
        </Menu.Item>
    ),
    (
        <Menu.Item key='logout'>
            <a onClick={logout}>Logout</a>
        </Menu.Item>
        )
    ]


const desktop = (l, profileItems, username)=>()=>{
    return (<Menu theme="dark"
          mode={'horizontal'}
          selectedKeys={[l]}
          style={{ lineHeight: '64px' }}
        >
        <Menu.Item>Mr Scrooge</Menu.Item>
        {Contents()}
        <Menu.SubMenu
            title={<span>User: {username} &nbsp; <Dropdown/></span>}>
        {profileItems}
        </Menu.SubMenu>
    </Menu>
    );
}

const mobile = (l, profileItems) => ()=>{
    return (
        <Menu theme="dark"
            mode={'horizontal'}
            selectedKeys={[l]}
            >
            <Menu.SubMenu
                title={<span>Menu</span>}>
                {Contents()}
                <Menu.Divider />
                {profileItems}
            </Menu.SubMenu>
        </Menu>
    )
}

export default ({location, logout, session}: IHeaderProps)=>{
    let l = location.pathname
    const lastPath = l.indexOf("/",2)
    if (lastPath) {
        l = l.substr(0, lastPath)
    }
    const c = profile(logout)
    return (<ResponsiveNav
        menuMarkup={desktop(l, c, session.username)}
        menuMarkupMobile={mobile(l, c)}
        mobileBreakPoint={767}
     />
     )
};