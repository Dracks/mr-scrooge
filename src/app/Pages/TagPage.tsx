import { Menu } from 'antd';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link, Route, Switch } from 'react-router-dom';

import { AddCircle } from '../../components/dessign/icons';
import SiderPage from '../../components/SiderPage';

import addPropsHoc from 'src/utils/router/addPropsHoc';
import EditTag from '../Tags/Edit';
import NewTag from '../Tags/New';
import { getPathElementName } from '../Utils';

const TagPage = ({location, match, tags}) => {
    const basepath=(match.url+'/').replace('//','/')

    const tagsListLinks=tags.map((e)=>{
        return <Menu.Item key={'/'+e.id}><Link to={basepath+e.id}>{e.name}</Link ></Menu.Item>;
    })
    const l = getPathElementName(location, match);

    const NewWithBasepath = addPropsHoc(NewTag, {basepath});
    const EditWithBasepath = addPropsHoc(EditTag as any, {basepath});
    return (<SiderPage
        side={(
            <Menu selectedKeys={[l]}>
                <Menu.Item key='/new'>
                    <Link to={basepath+'new'}>
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
                    path={basepath + "new"}
                    component={NewWithBasepath}/>

                <Route
                    path={basepath + ":id"}
                    component={EditWithBasepath}/>
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