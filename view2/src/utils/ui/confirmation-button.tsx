import { Box, Button, DropButton, DropButtonExtendedProps, Text } from 'grommet';
import React from 'react';

interface ConfirmationButtonArgs
    extends Omit<DropButtonExtendedProps, 'onOpen' | 'onClose' | 'open' | 'dropContent' | 'dropProps'> {
    confirmationText?: string;
    onConfirm: () => void;
}

export const ConfirmationButton: React.FC<ConfirmationButtonArgs> = ({ onConfirm, confirmationText, ...props }) => {
    const [showConfirmation, setShowConfirmation] = React.useState<boolean>(false);
    return (
        <DropButton
            {...props}
            open={showConfirmation}
            onOpen={() => setShowConfirmation(true)}
            onClose={() => setShowConfirmation(false)}
            dropContent={
                <Box pad="small" round gap="small" background={{ color: 'light-2', opacity: 'strong' }}>
                    <Text>{confirmationText ? confirmationText : 'Are you sure?'}</Text>
                    <Button
                        label="yes"
                        primary
                        color={props.color}
                        onClick={() => {
                            setShowConfirmation(false);
                            onConfirm();
                        }}
                    />{' '}
                    <Button
                        label="no"
                        onClick={() => {
                            setShowConfirmation(false);
                        }}
                    />
                </Box>
            }
            dropProps={{ align: { top: 'bottom' } }}
        />
    );
};
