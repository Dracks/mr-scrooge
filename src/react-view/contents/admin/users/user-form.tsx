import { Box, CheckBox, FormField, ResponsiveContext, TextInput } from "grommet";
import React from "react";

export const UserForm: React.FC = ()=>{
    const size = React.useContext(ResponsiveContext);
    return <Box direction={size === 'small' ? 'column' : 'row'}>
        <Box>
        <FormField name="username" label="User name" component={TextInput} minLength={5} required/>
        <FormField label="Password" htmlFor='password-field'>
            <TextInput
                type='password'
                required
                id='password-field'
                name='password'
               minLength={8} />
        </FormField>
        <FormField name="isActive">
          <CheckBox name="isActive" label="Is active?" />
        </FormField>
        <FormField name="isAdmin">
          <CheckBox name="isAdmin" label="Is admin?" />
        </FormField>
        </Box>
        <Box>
            <FormField label="E-Mail" htmlFor='email-field'>
                <TextInput
                    type='email'
                    id='email-field'
                    name='email' />
            </FormField>
            <FormField name="firstName" label="First Name" component={TextInput} />
            <FormField name="lastName" label="Last Name" component={TextInput} />
        </Box>
    </Box>
}