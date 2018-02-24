import React from 'react'
import { Link } from 'react-router-dom';

const Header = () => {
    return (<nav className="green">
        <div className="nav-wrapper">
            <a href="/" className="brand-logo">Finances</a>
            <ul id="nav-mobile" className="right hide-on-med-and-down">
                <li><Link to='/raw-data'>RawData</Link></li>
                <li><Link to='/'>Report</Link></li>
                <li><Link to='/tag'>Tags</Link></li>
            </ul>
        </div>
    </nav>);
}

export default Header;