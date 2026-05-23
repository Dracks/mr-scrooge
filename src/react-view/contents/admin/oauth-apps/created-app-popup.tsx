import { Box, Button, Heading, Layer, Text, TextInput } from 'grommet';
import React from 'react';

import { OAuthClientWithSecret } from '../../../api/models';
import { WarningNotice } from '../../../utils/ui/warning-notice';

interface CreatedAppPopupProps {
    app: OAuthClientWithSecret;
    onContinue: () => void;
}

export const CreatedAppPopup: React.FC<CreatedAppPopupProps> = ({ app, onContinue }) => {
    const [copiedField, setCopiedField] = React.useState<string | null>(null);

    const handleCopy = (label: string, value: string) => {
        void navigator.clipboard.writeText(value).then(() => {
            setCopiedField(label);
            setTimeout(() => {
                setCopiedField(null);
            }, 2000);
        });
    };

    return (
        <Layer modal position="center" onEsc={() => {}} onClickOutside={() => {}}>
            <Box pad="medium" gap="medium" width="large">
                <Heading level={3}>Application Created</Heading>
                <Text weight="bold">Client ID</Text>
                <Box direction="row" align="center" gap="small">
                    <TextInput readOnly value={app.client_id} />
                    <Button
                        label={copiedField === 'client_id' ? 'Copied!' : 'Copy'}
                        onClick={() => {
                            handleCopy('client_id', app.client_id);
                        }}
                    />
                </Box>
                <Text weight="bold">Client Secret</Text>
                <Box direction="row" align="center" gap="small">
                    <TextInput readOnly value={app.secret} />
                    <Button
                        label={copiedField === 'secret' ? 'Copied!' : 'Copy'}
                        onClick={() => {
                            handleCopy('secret', app.secret);
                        }}
                    />
                </Box>
                <WarningNotice>Save this secret — you won't be able to see it again</WarningNotice>
                <Button primary label="Continue" onClick={onContinue} />
            </Box>
        </Layer>
    );
};
