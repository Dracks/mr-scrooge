import { Box, CheckBox, FormField, TextArea, TextInput } from 'grommet';
import React from 'react';

import { OAUTH_SCOPES, OAuthScope } from '../../../api/models';

const SCOPE_LABELS: Record<OAuthScope, string> = {
    userInfo: 'User Info',
    uploadFile: 'Upload File',
};

export interface OAuthAppFormData {
    name: string;
    description?: string;
    redirect_uris: string[];
    scopes: OAuthScope[];
}

interface OAuthAppFormProps {
    value: OAuthAppFormData;
    onChange: (value: OAuthAppFormData) => void;
    errors?: Record<string, string>;
}

export const OAuthAppForm: React.FC<OAuthAppFormProps> = ({ value, onChange, errors }) => {
    const [redirectUrisText, setRedirectUrisText] = React.useState(value.redirect_uris.join('\n'));

    React.useEffect(() => {
        setRedirectUrisText(value.redirect_uris.join('\n'));
    }, [value.redirect_uris]);

    const handleRedirectUrisChange = (text: string) => {
        setRedirectUrisText(text);
        const uris = text
            .split('\n')
            .map(u => u.trim())
            .filter(u => u.length > 0);
        onChange({ ...value, redirect_uris: uris });
    };

    const handleScopeToggle = (scope: OAuthScope, checked: boolean) => {
        const currentScopes = value.scopes;
        let newScopes: OAuthScope[];
        if (checked) {
            newScopes = [...currentScopes, scope];
        } else {
            newScopes = currentScopes.filter(s => s !== scope);
        }
        onChange({ ...value, scopes: newScopes });
    };

    const handleDescriptionChange = (text: string) => {
        onChange({ ...value, description: text.length > 0 ? text : undefined });
    };

    return (
        <>
            <FormField label="Name" error={errors?.name}>
                <TextInput
                    value={value.name}
                    onChange={e => {
                        onChange({ ...value, name: e.target.value });
                    }}
                />
            </FormField>
            <FormField label="Description" error={errors?.description}>
                <TextArea
                    value={value.description || ''}
                    onChange={e => {
                        handleDescriptionChange(e.target.value);
                    }}
                />
            </FormField>
            <FormField label="Redirect URIs (one per line)" error={errors?.redirect_uris}>
                <TextArea
                    value={redirectUrisText}
                    onChange={e => {
                        handleRedirectUrisChange(e.target.value);
                    }}
                />
            </FormField>
            <FormField label="Scopes">
                <Box>
                    {OAUTH_SCOPES.map(scope => (
                        <CheckBox
                            key={scope}
                            label={SCOPE_LABELS[scope]}
                            checked={value.scopes.includes(scope)}
                            onChange={e => {
                                handleScopeToggle(scope, e.target.checked);
                            }}
                        />
                    ))}
                </Box>
            </FormField>
        </>
    );
};

export const getOAuthAppFormData = (): OAuthAppFormData => ({
    name: '',
    description: undefined,
    redirect_uris: [],
    scopes: [],
});
