import { Box, Button, Form, FormField, Heading, Select, TextInput } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApi } from '../../api/client';
import { UpdateMyProfile } from '../../api/models';
import { useLogger } from '../../utils/logger/logger.context';
import { useSession, useUserProfileOrThrows } from '../../utils/session/session-context';

export const EditProfile = () => {
    const {
        refresh,
    } = useSession();
    const {firstName, lastName, ...profile} = useUserProfileOrThrows()

    const client = useApi()
    const updateProfile = useAsyncCallback((data: UpdateMyProfile)=>client.PUT("/session/me", {
        body: data
    }))
    const logger = useLogger();
    const [uiProfile, setUiProfile] = React.useState<UpdateMyProfile & { newPassword2?: string }>({
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
            <Form<UpdateMyProfile>
                value={uiProfile}
                onChange={setUiProfile}
                onSubmit={() => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { newPassword2, ...data } = uiProfile;
                    logger.info('New sent data', { data });
                    updateProfile.execute(
                        data,
                    ).then(()=>{
                        setUiProfile({
                            ...uiProfile,
                            password: '',
                            newPassword: '',
                            newPassword2: '',
                        });
                        refresh();
                    }).catch((error:unknown)=> {
                        logger.error("Error updating the user info", { error })
                    })
                    
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
                <Box justify='center'>
                    <Heading level="3">Groups</Heading>
                    <FormField label="Default group" htmlFor='select-default-group'>
                        <Select 
                        id="select-default-group" 
                        options={profile.groups} 
                        name="defaultGroupId"
                        labelKey="name" 
                        valueKey={{key: 'id', reduce: true}} />
                    </FormField>
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
