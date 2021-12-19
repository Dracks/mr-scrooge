import * as React from 'react';
import { connect } from 'react-redux';

import { IStoreType } from 'src/reducers';
import addDispatch from 'src/utils/redux/AddDispatch';
import { ISession } from '../Session/types';
import ProfileForm from './Form';
import { IUpdateProfileData, ProfileActions } from './redux';

interface IProfilePageProps{
    profile: ISession
    save: (data: IUpdateProfileData)=>void
}

const ProfilePage = ({profile, save}:IProfilePageProps)=>(
    <div style={{ padding: '0 50px' }}>
        <div style={{ background: '#fff', padding: 24, minHeight: 280 }}>
            <h1>Profile</h1>
            <ProfileForm profile={profile} save={save}/>
        </div>
    </div>
)

const mapStateToProps = ({session}: IStoreType) => ({
    profile: session.data
})

const mapDispatchToProps = addDispatch({
    save: ProfileActions.update
})

const connector = connect(mapStateToProps, mapDispatchToProps)

export default connector(ProfilePage);