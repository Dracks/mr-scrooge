import { Box, Button, Form, FormField, Heading, Layer, TextInput } from 'grommet';
import React, { useEffect, useState } from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApiClient } from '../../api/client';
import { ApiUUID, Label, LabelUpdate } from '../../api/models';
import { useLogger } from '../../utils/logger/logger.context';
import { catchAndLog } from '../../utils/promises';
import { ConfirmationButton } from '../../utils/ui/confirmation-button';
import { useLabelsContext } from '../common/label.context';

export const EditLabelModal: React.FC<{
    label: Label;
    onClose: () => void;
}> = ({ label, onClose }) => {
    const logger = useLogger('EditLabelModal');
    const apiClient = useApiClient();
    const labels = useLabelsContext();
    const [editingLabel, setEditingLabel] = useState<LabelUpdate>(label);
    useEffect(() => {
        setEditingLabel(label);
    }, [label.id]);
    const saveUpdate = useAsyncCallback(async (labelId: ApiUUID, label: LabelUpdate) => {
        const response = await apiClient.PUT('/labels/{labelId}', { body: label, params: { path: { labelId } } });
        if (response.data) {
            labels.replace(response.data);
        }
    });

    const deleteLabel = useAsyncCallback(async (labelId: ApiUUID) => {
        const response = await apiClient.DELETE('/labels/{labelId}', { params: { path: { labelId } } });
        if (response.response.status == 200) {
            onClose();
            labels.delete(label);
        }
    });
    return (
        <Layer onEsc={onClose} onClickOutside={onClose} modal position="center">
            <Box pad="medium">
                <Heading level="2">Edit Label</Heading>
                <Form<LabelUpdate>
                    value={editingLabel}
                    onChange={newValue => {
                        setEditingLabel(newValue);
                    }}
                    onSubmit={() => {
                        catchAndLog(saveUpdate.execute(label.id, editingLabel), 'Error updating the label', logger);
                    }}
                >
                    <FormField name="name" label="Label Name" component={TextInput} />

                    <Box direction="row" gap="small">
                        <Button primary label="Save" type="submit" disabled={!editingLabel.name} />
                        <Button label="Close" onClick={onClose} />
                        <ConfirmationButton
                            color="accent-4"
                            label="Delete"
                            onConfirm={() => {
                                catchAndLog(deleteLabel.execute(label.id), 'Error deleting the label', logger);
                            }}
                        />
                    </Box>
                </Form>
            </Box>
        </Layer>
    );
};
