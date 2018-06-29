import React from 'react'
import { Link } from 'react-router-dom';
import { Menu, Icon } from 'antd';

const Header = ({logout, location}) =>{
    var l = location.pathname
    var last_path = l.indexOf("/",2)
    if (last_path) {
        l = l.substr(0, last_path)
    }
    return (
        <Menu
          onClick={this.handleClick}
          selectedKeys={[l]}
          mode="horizontal"
        >
            <Menu.Item key="/">
                <Link to='/'>Report</Link>
            </Menu.Item>
            <Menu.Item key="/import">
                <Link to='/import'>Import</Link>
            </Menu.Item>
            <Menu.Item key="/tag">
                <Link to='/tag'>Tags</Link>
            </Menu.Item>
            <Menu.Item key="/raw-data">
                <Link to='/raw-data'>RawData</Link>
            </Menu.Item>
            <Menu.Item>
                <a onClick={logout}>Logout</a>
            </Menu.Item>
        </Menu>
    );
}

export default Header;