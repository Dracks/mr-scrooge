import React from 'react'

import { UserProfile } from '../../../api/models'
import { useLogger } from '../../../utils/logger/logger.context'
import { Box, Form, Heading } from 'grommet'
import { UserForm } from './user-form'

interface EditUserParams {
    user: UserProfile
}

export const EditUser: React.FC<EditUserParams> = ({user})=>{
    const logger = useLogger("EditUser")
    return <Box>
        <Heading level={2}>Editing user</Heading>
        <Form<UserProfile> value={user}>
            <UserForm />
        </Form>
    </Box>
}