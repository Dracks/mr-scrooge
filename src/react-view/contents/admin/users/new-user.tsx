import { Box, Button, Form, Heading } from 'grommet'
import React from 'react'
import { useAsyncCallback } from 'react-async-hook'
import { useNavigate } from 'react-router'

import { useApi } from '../../../api/client'
import { CreateUserParams } from '../../../api/models'
import { useLogger } from '../../../utils/logger/logger.context'
import { catchAndLog } from '../../../utils/promises'
import { UserForm } from './user-form'

export const NewUser : React.FC = ()=>{
    const logger = useLogger("New User Form")
    const navigate = useNavigate()
    const client = useApi()
    const createUser = useAsyncCallback((body: CreateUserParams)=>{
        return client.POST("/users", {body})
    })
    const [userData, setUserData] = React.useState<CreateUserParams>({
        email: "",
        isActive: true,
        isAdmin: false,
        password: "",
        username: "",
        firstName: "",
        lastName: ""
    })
    return <Box>
        <Heading level={2}>Create new user</Heading>
        <Form<CreateUserParams>
            value={userData}
            onChange={setUserData}
            onSubmit={() => {
                catchAndLog(createUser.execute(userData).then(response => {
                    const newUser = response.data
                    if (newUser){
                        navigate(`../${newUser.id}`)
                    }
                }), "Error creating a new user", logger)
            }}
        >
            <UserForm />
            <Button
                primary
                label="Save"
                type="submit"
                disabled={!userData.username || !userData.password} />
                    
        </Form>
    </Box>
}