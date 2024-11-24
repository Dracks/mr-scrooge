import React from 'react'
import { useParams } from 'react-router'

import { UserProfile } from '../../../api/models'
import NotFound from '../../extra/not-found'
import { EditUser } from './user-edit'

interface UserSwitcherParams {
    users: UserProfile[]
}

export const UserSwitcher : React.FC<UserSwitcherParams> = ({users})=>{
    const {id} = useParams()
    const userDetails = users.find(user => user.id === id)
    console.log(id, users)
    return userDetails ? <EditUser user={userDetails} /> : <NotFound />
    
}