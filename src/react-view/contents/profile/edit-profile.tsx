import { Box, Button, Form, FormField, Heading, TextInput } from 'grommet';
import React from 'react';

import { useLogger } from '../../utils/logger/logger.context';
import { useSession } from '../../utils/session/session-context';

export const EditProfile = () => {
    const {
        refresh,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        session,
    } = useSession();
    const [, updateProfile] = usePatchUserInfo();
    const logger = useLogger();
    const [uiProfile, setUiProfile] = React.useState<UserInfoWithPassword & { newPassword2?: string }>({
        password: '',
        firstName: firstName ? firstName : '',
        lastName: lastName ? lastName : '',
        ...profile,
    });
    logger.info('Edit profile', { uiProfile });
    const passwordError = uiProfile.newPassword === uiProfile.newPassword2 ? undefined : 'The new passwords must match';
    return (
        <Box fill align="center" justify="center">
            <Heading level="2">Edit profile</Heading>
            <Form<UserInfoWithPassword>
                value={uiProfile}
                onChange={setUiProfile}
                onSubmit={async () => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { newPassword2, ...data } = uiProfile;
                    logger.info('New sent data', { data });
                    await updateProfile({
                        data,
                    });
                    setUiProfile({
                        ...uiProfile,
                        password: '',
                        newPassword: '',
                        newPassword2: '',
                    });
                    await refresh();
                }}
            >
                <Box direction="row-responsive" justify="center" gap="medium">
                    <Box align="center" gap="small">
                        <FormField label="Username" name="username" component={TextInput} />
                        <FormField label="E-Mail" name="email" component={TextInput} type="email" />
                        <FormField label="First name" name="firstName" component={TextInput} />
                        <FormField label="Last name" name="lastName" component={TextInput} />
                    </Box>
                    <Box align="top" gap="small">
                        <FormField
                            label="Old password"
                            name="password"
                            component={TextInput}
                            type="password"
                            required
                        />
                        <FormField
                            label="New password"
                            name="newPassword"
                            component={TextInput}
                            type="password"
                            error={passwordError}
                        />
                        <FormField
                            label="Repeat new password"
                            name="newPassword2"
                            component={TextInput}
                            type="password"
                            error={passwordError}
                        />
                    </Box>
                </Box>
                <Box justify="center" align="center" pad="small">
                    <Button
                        label="save"
                        primary
                        type="submit"
                        disabled={uiProfile.newPassword !== uiProfile.newPassword2}
                    />
                </Box>
            </Form>
        </Box>
    );
};
