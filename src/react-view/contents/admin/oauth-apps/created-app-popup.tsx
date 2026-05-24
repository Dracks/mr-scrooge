import { Box, Button, Heading, Layer, Text, TextInput } from 'grommet';
import React from 'react';

import { OAuthClientWithSecret } from '../../../api/models';
import { CopyStatusLine, useClipboardCopy } from '../../../utils/ui/clipboard-copy';
import { WarningNotice } from '../../../utils/ui/warning-notice';

interface CreatedAppPopupProps {
    app: OAuthClientWithSecret;
    onContinue: () => void;
}

export const CreatedAppPopup: React.FC<CreatedAppPopupProps> = ({ app, onContinue }) => {
    const { handleCopy: copyClientId, status: clientIdStatus } = useClipboardCopy();
    const { handleCopy: copySecret, status: secretStatus } = useClipboardCopy();

    return (
        <Layer modal position="center" onEsc={() => {}} onClickOutside={() => {}}>
            <Box pad="medium" gap="medium" width="large">
                <Heading level={3}>Application Created</Heading>
                <Text weight="bold">Client ID</Text>
                <Box gap="xsmall">
                    <Box direction="row" align="center" gap="small">
                        <TextInput readOnly value={app.client_id} />
                        <Button
                            label="Copy"
                            disabled={clientIdStatus.state === 'disabled'}
                            onClick={() => {
                                copyClientId(app.client_id);
                            }}
                        />
                    </Box>
                    <CopyStatusLine status={clientIdStatus} />
                </Box>
                <Text weight="bold">Client Secret</Text>
                <Box gap="xsmall">
                    <Box direction="row" align="center" gap="small">
                        <TextInput readOnly value={app.secret} />
                        <Button
                            label="Copy"
                            disabled={secretStatus.state === 'disabled'}
                            onClick={() => {
                                copySecret(app.secret);
                            }}
                        />
                    </Box>
                    <CopyStatusLine status={secretStatus} />
                </Box>
                <WarningNotice>Save this secret — you won't be able to see it again</WarningNotice>
                <Button primary label="Continue" onClick={onContinue} />
            </Box>
        </Layer>
    );
};
