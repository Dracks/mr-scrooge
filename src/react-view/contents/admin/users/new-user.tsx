import { Box, Button, Form, Heading } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';
import { useNavigate } from 'react-router';

import { useApiClient } from '../../../api/client';
import { CreateUserInput } from '../../../api/models';
import { useLogger } from '../../../utils/logger/logger.context';
import { catchAndLog } from '../../../utils/promises';
import { UserForm, UserWarning } from './user-form';

export const NewUser: React.FC<{ reload: () => void }> = ({ reload }) => {
    const logger = useLogger('New User Form');
    const navigate = useNavigate();
    const client = useApiClient();
    const createUser = useAsyncCallback((body: CreateUserInput) => {
        return client.POST('/users', { body });
    });
    const [userData, setUserData] = React.useState<CreateUserInput>({
        email: '',
        isActive: true,
        isAdmin: false,
        password: '',
        username: '',
        firstName: '',
        lastName: '',
    });
    return (
        <Box>
            <Heading level={2}>Create new user</Heading>
            <Form<CreateUserInput>
                value={userData}
                onChange={setUserData}
                onSubmit={() => {
                    catchAndLog(
                        createUser.execute(userData).then(async response => {
                            const newUser = response.data;
                            if (newUser) {
                                reload();
                                await navigate(newUser.id);
                            }
                        }),
                        'Error creating a new user',
                        logger,
                    );
                }}
            >
                <UserForm />
                <UserWarning
                    newFlag={userData.isActive}
                    oldFlag={true}
                    newActive=""
                    newDisabled="User will be created disabled"
                />
                <UserWarning
                    newFlag={userData.isAdmin}
                    oldFlag={false}
                    newActive="User will be created as admin"
                    newDisabled=""
                />
                <Button
                    primary
                    label="Create"
                    type="submit"
                    disabled={!userData.username || !userData.password || createUser.loading}
                />
            </Form>
        </Box>
    );
};
