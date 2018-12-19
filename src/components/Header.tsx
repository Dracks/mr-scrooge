import { Menu } from 'antd';
import * as React from 'react'
import { Link } from 'react-router-dom';
import ResponsiveNavDefault from '../components/ResponsiveNav';

import { ISession } from 'src/app/Session/types';
import ResizableHOC from '../utils/responsive/HOC';
import { Dropdown } from './dessign/icons';

const ResponsiveNav = ResizableHOC(ResponsiveNavDefault);

interface IHeaderProps {
    pathname: string,
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

export default ({pathname, logout, session}: IHeaderProps)=>{
    const lastPath = pathname.indexOf("/",2)
    if (lastPath>0) {
        pathname = pathname.substr(0, lastPath)
    }
    const c = profile(logout)
    return (<ResponsiveNav
        menuMarkup={desktop(pathname, c, session.username)}
        menuMarkupMobile={mobile(pathname, c)}
        mobileBreakPoint={767}
     />
     )
};