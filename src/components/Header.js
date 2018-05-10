import React from 'react'
import { Link } from 'react-router-dom';

const Header = ({logout}) => {
    return (<nav className="green">
        <div className="nav-wrapper">
            <Link to="/" className="brand-logo">Finances</Link>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
                <li><Link to='/'>Report</Link></li>
                <li><Link to='/import'>Import</Link></li>
                <li><Link to='/tag'>Tags</Link></li>
                <li><Link to='/raw-data'>RawData</Link></li>
                <li><a onClick={logout}>Logout</a></li>
            </ul>
        </div>
    </nav>);
}

export default Header;