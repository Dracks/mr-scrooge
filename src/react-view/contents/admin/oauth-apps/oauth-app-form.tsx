import { Box, CheckBox, FormField, TextArea, TextInput } from 'grommet';
import React from 'react';

import { OAuthScope } from '../../../api/models';

export interface OAuthAppFormData {
    name: string;
    description?: string;
    redirect_uris: string[];
    scopes: OAuthScope[];
}

interface OAuthAppFormProps {
    value: OAuthAppFormData;
    onChange: (value: OAuthAppFormData) => void;
    showScopes?: boolean;
}

export const OAuthAppForm: React.FC<OAuthAppFormProps> = ({ value, onChange, showScopes = true }) => {
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
            <FormField label="Name">
                <TextInput
                    value={value.name}
                    onChange={e => {
                        onChange({ ...value, name: e.target.value });
                    }}
                />
            </FormField>
            <FormField label="Description">
                <TextArea
                    value={value.description || ''}
                    onChange={e => {
                        handleDescriptionChange(e.target.value);
                    }}
                />
            </FormField>
            <FormField label="Redirect URIs (one per line)">
                <TextArea
                    value={redirectUrisText}
                    onChange={e => {
                        handleRedirectUrisChange(e.target.value);
                    }}
                />
            </FormField>
            {showScopes && (
                <FormField label="Scopes">
                    <Box>
                        <CheckBox
                            label="User Info"
                            checked={value.scopes.includes('userInfo')}
                            onChange={e => {
                                handleScopeToggle('userInfo', e.target.checked);
                            }}
                        />
                        <CheckBox
                            label="Upload File"
                            checked={value.scopes.includes('uploadFile')}
                            onChange={e => {
                                handleScopeToggle('uploadFile', e.target.checked);
                            }}
                        />
                    </Box>
                </FormField>
            )}
        </>
    );
};

export const getOAuthAppFormData = (): OAuthAppFormData => ({
    name: '',
    description: undefined,
    redirect_uris: [],
    scopes: [],
});
