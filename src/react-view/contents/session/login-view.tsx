import { Box, Button, Form, FormField, Heading, Keyboard, Text, TextInput } from 'grommet';
import React from 'react';

import { useLogger } from '../../utils/logger/logger.context';

export interface LoginCredentials {
    password: string;
    username: string;
}

interface LoginProps {
    error?: { message: string } | null;
    invalidCredentials: boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => void;
}

const LoginView = ({ login, isLoading, error, invalidCredentials }: LoginProps) => {
    const [credentials, setCredentials] = React.useState<LoginCredentials>({
        username: '',
        password: '',
    });
    useLogger('LoginView').info('loggin', { error, invalidCredentials });

    return (
        <Box fill align="center" justify="center">
            <Box>
                <Heading>Login</Heading>
                <Form<LoginCredentials>
                    value={credentials}
                    onChange={setCredentials}
                    onSubmit={() => {
                        login(credentials);
                    }}
                    data-testid="login-form"
                >
                    <FormField label="User" name="username" required component={TextInput} />

                    <Keyboard
                        onEnter={() => {
                            login(credentials);
                        }}
                    >
                        <FormField label="Password" name="password" required component={TextInput} type="password" />
                    </Keyboard>

                    {(invalidCredentials || error) && (
                        <Box pad={{ horizontal: 'small' }}>
                            <Text color="status-error">{error ? error.message : 'Invalid credentials'}</Text>
                        </Box>
                    )}

                    <Button type="submit" disabled={isLoading} label="Login" />
                </Form>
            </Box>
        </Box>
    );
};

export default LoginView;
