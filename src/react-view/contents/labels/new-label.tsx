import { Box, Button, Form, FormField, Heading, TextInput } from 'grommet';
import React, { useEffect, useState } from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApiClient } from '../../api/client';
import { Label, LabelCreate } from '../../api/models';
import { useLogger } from '../../utils/logger/logger.context';
import { catchAndLog } from '../../utils/promises';
import { useUserProfileOrThrows } from '../../utils/session/session-context';
import { useLabelsContext } from '../common/label.context';

export const NewLabelModal: React.FC<{
    onClose: (label?: Label) => void;
}> = ({ onClose }) => {
    const logger = useLogger('NewLabelModal');
    const apiClient = useApiClient();
    const user = useUserProfileOrThrows()
    const labels = useLabelsContext();
    const [editingLabel, setEditingLabel] = useState<LabelCreate>({
        name: "",
        groupOwnerId: user.defaultGroupId
    });
    useEffect(()=>{
        setEditingLabel({
            name: "",
            groupOwnerId: user.defaultGroupId
        })
    }, [])
    const saveUpdate = useAsyncCallback(async ( label: LabelCreate) => {
        const response = await apiClient.POST('/labels', { body: label });
        if (response.data) {
            labels.replace(response.data);
            onClose(response.data)
        }
    });

    return (
        
            <Box pad="medium">
                <Heading level="2">New Label</Heading>
                <Form<LabelCreate>
                    value={editingLabel}
                    onChange={newValue => {
                        setEditingLabel(newValue);
                    }}
                    onSubmit={() => {
                        catchAndLog(saveUpdate.execute(editingLabel), 'Error creating the new label', logger);
                    }}
                >
                    <FormField name="name" label="Label Name" component={TextInput} />

                    <Box direction="row" gap="small">
                        <Button primary label="Create" type="submit" disabled={!editingLabel.name || saveUpdate.loading} />
                        <Button label="Close" onClick={() => { onClose() }} />
                    </Box>
                </Form>
            </Box>
    );
};
