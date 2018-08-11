import React from 'react';
import { connect } from 'react-redux';
import { Link, Route, Switch } from 'react-router-dom';
import { Menu } from 'antd';

import SiderPage from '../../components/SiderPage';
import { AddCircle } from '../../components/dessign/icons';

import NewTag from '../Tags/New';
import EditTag from '../Tags/Edit';
import { getPathElementName } from '../Utils';

const TagPage = ({location, match, tags}) => {
    const basepath=match.url
    console.log(match.url, basepath);
    const tagsListLinks=tags.map((e)=>{
        const key = '/'+e.id;
        return <Menu.Item key={key}><Link to={basepath+key}>{e.name}</Link ></Menu.Item>;
    })
    var l = getPathElementName(location, match);
    console.log(l)
    return (<SiderPage 
        side={(
            <Menu selectedKeys={[l]}>
                <Menu.Item key='/new'>
                    <Link to={basepath+'/new'}> 
                        <AddCircle />
                        Create
                    </Link>
                </Menu.Item>
                {tagsListLinks}
            </Menu>
        )} 
        content={(
            <Switch>
                <Route
                    path={basepath + "/new"}
                    component={NewTag}/>

                <Route
                    path={basepath + "/:id"}
                    component={EditTag}/>
            </Switch>

        )}
    />)
}
const mapStateToProps = state => {
    return {
        tags: state.tags.data
    }
}
export default connect(mapStateToProps)(TagPage)