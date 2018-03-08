import React from 'react';
import { connect } from 'react-redux';
import { Link, Route, Switch } from 'react-router-dom';

import NewTag from '../Tags/New';
import EditTag from '../Tags/Edit';

const TagPage = (props) => {
    const basepath=props.match.url
    const tagsListLinks=props.tags.map((e, index)=>{
        return <Link key={index} to={basepath+'/'+e.id} className="collection-item">{e.name}</Link>;
    })
    return (<div className="row">
        <div className="col s3">
            <div className="input-field inline">
                <i className="material-icons prefix">search</i>
                <input id="icon_prefix" type="text" />
            </div>
            <div className="collection">
                <Link to={basepath+'/new'} className="collection-item"> 
                    <i className="material-icons">add</i> 
                    Create 
                </Link>
                {tagsListLinks}
            </div>
        </div>
        <div className="col s9">
            <Switch>
                <Route
                    path={basepath + "/new"}
                    component={NewTag}/>

                <Route
                    path={basepath + "/:id"}
                    component={EditTag}/>
            </Switch>
        </div>

    </div>)
}
const mapStateToProps = state => {
    return {
        tags: state.tags.data
    }
}
export default connect(mapStateToProps)(TagPage)