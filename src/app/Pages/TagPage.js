import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';

const TagPage = (props) => {
    const basepath=props.match.url
    const tagsListLinks=props.tags.map((e)=>{
        return <Link to={basepath+'/'+e.id} className="collection-item">{e.name}</Link>;
    })
    return (<div className="row">
        <div className="col s3">
            <div className="input-field">
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
            contents
        </div>

    </div>)
}
const mapStateToProps = state => {
    return {
        tags: state.tags.data
    }
}
export default connect(mapStateToProps)(TagPage)