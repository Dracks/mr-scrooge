import { Box, Button, Text } from 'grommet';
import { FormClose } from 'grommet-icons';
import React from 'react';

export interface ITagModel {
    id: number;
    name: string;
}

export const Tag: React.FC<{ onRemove?: () => void }> = ({ children, onRemove }) => {
    return (
        <Box
            direction="row"
            align="center"
            background="brand"
            pad={{ horizontal: 'xsmall', vertical: 'xxsmall' }}
            margin={{ vertical: 'xxsmall' }}
            round="medium"
        >
            <Text size="xsmall" margin={{ right: 'xxsmall' }}>
                {children}
            </Text>
            {onRemove && (
                <Button onClick={onRemove}>
                    <FormClose size="small" color="white" />
                </Button>
            )}
        </Box>
    );
};
