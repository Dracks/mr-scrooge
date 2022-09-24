import { AxiosError } from 'axios'
import { Box, Heading, TextInput, Button, Keyboard, Form, FormField, Text } from 'grommet'
import React from 'react'

import { useLogger } from '../../utils/logger/logger.context'

export interface LoginCredentials {
    username: string
    password: string
}

interface LoginProps {
    login: (credentials: LoginCredentials) => void
    isLoading: boolean
    error?: AxiosError | null
    invalidCredentials: boolean
}

const Login = ({ login, isLoading, error, invalidCredentials }: LoginProps) => {
    const [credentials, setCredentials] = React.useState<LoginCredentials>({ username: '', password: '' })
    useLogger().info("loggin", { error, invalidCredentials })

    return (
        <Box fill align="center" justify="center">
            <Box>
                <Heading>Login</Heading>
                <Form<LoginCredentials>
                    value={credentials}
                    onChange={setCredentials}
                    onSubmit={() => login(credentials)}
                >
                    <FormField label="User" name="username" required component={TextInput} />

                    <Keyboard onEnter={() => login(credentials)}>
                        <FormField label="Password" name="password" required component={TextInput} type='password'/>
                    </Keyboard>

                    {(invalidCredentials || error) && (
                        <Box pad={{ horizontal: 'small' }}>
                            <Text color="status-error">{error ? error.message : "Invalid credentials"}</Text>
                        </Box>
                    )}

                    <Button
                        type='submit'
                        disabled={isLoading}
                        label="Login"
                    />
                </Form>

            </Box>
        </Box>
    )
}

export default Login
