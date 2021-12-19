import { AxiosError } from 'axios'
import { Box, Heading, TextInput, Button } from 'grommet'
import React from 'react'

import { ErrorsCode } from '../../utils/errors'

interface LoginProps {
    login: (username: string, password: string) => void
    isLoading: boolean
    error?: AxiosError | null
}

const ERRORS_TEXT: { [key in ErrorsCode]?: string } = {
    [ErrorsCode.userNotFound]: 'Credentials not valid',
}

const Login = ({ login, isLoading }: LoginProps) => {
    const [username, setUsername] = React.useState('')
    const [password, setPassword] = React.useState('')
    /*if (error) {
        formProps = {
            isInvalid: true,
            error: ERRORS_TEXT[error.code],
        }
    }*/
    return (
        <Box fill align="center" justify="center">
            <Box>
                <Heading>Login</Heading>
                <TextInput
                    placeholder="email"
                    title="Email"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />
                <TextInput
                    placeholder="password"
                    title="Password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <Button
                    onClick={() => login(username, password)}
                    disabled={isLoading}
                    label="Login"
                />
            </Box>
        </Box>
    )
}

export default Login
