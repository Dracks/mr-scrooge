import { Box, Button, Form, Heading } from 'grommet'
import React from 'react'
import { useAsyncCallback } from 'react-async-hook'

import { useApi } from '../../../api/client'
import { ApiUUID, UpdateUserParams, UserProfile } from '../../../api/models'
import { useLogger } from '../../../utils/logger/logger.context'
import { catchAndLog } from '../../../utils/promises'
import { UserForm, UserWarning } from './user-form'

interface EditUserParams {
    user: UserProfile
}

const getUpdateFromUser = (user: UserProfile) => ({
    defaultGroupId: user.defaultGroupId,
    email: user.email,
    isActive: user.isActive,
    isAdmin: user.isAdmin,
    username: user.username,
    firstName: user.firstName,
    lastName: user.lastName,
    password: ''
})


export const EditUser: React.FC<EditUserParams> = ({user})=>{
    const logger = useLogger("EditUser")
    const client = useApi()
    const saveUser = useAsyncCallback((id: ApiUUID, body: UpdateUserParams) => {
        return client.PUT("/users/{id}", {body, params: {path: {id}}})
    })
    const [userData, setUserData] = React.useState<UpdateUserParams>(getUpdateFromUser(user))
    
    React.useEffect(()=>{
        setUserData(user)
    }, [user.id])
    return <Box>
        <Heading level={2}>Editing user</Heading>
        <Form<UpdateUserParams> value={userData} onChange={setUserData} onSubmit={()=>{
            catchAndLog(saveUser.execute(user.id, userData), "Error updating the user", logger)
        }}>
            <UserForm />
            <UserWarning newFlag={userData.isAdmin} oldFlag={user.isAdmin} newActive='User will be admin' newDisabled='User will stop being admin' />
            <UserWarning newFlag={userData.isActive} oldFlag={user.isActive} newActive='User will be enabled' newDisabled='User will be disabled' />
            <Button primary
            label="Save"
            type="submit"
            disabled={!userData.username || !userData.password || saveUser.loading} />
        </Form>
    </Box>
}