import { Button, Form, FormField, TableCell, TableRow, TextInput } from 'grommet';
import React from 'react';

import { Tag } from '../../api/client/tag/types';
import { usePostTags } from '../../api/client/tag/use-post-tag';
import { useLogger } from '../../utils/logger/logger.context';

interface NewTagRowProps {
    close: (newTag?: Tag) => Promise<void> | void;
}
export const NewTagRow: React.FC<NewTagRowProps> = ({ close }) => {
    const [, useCreateTag] = usePostTags();
    const [name, setName] = React.useState('');
    const logger = useLogger();

    return (
        <TableRow>
            <TableCell></TableCell>
            <TableCell>
                <TextInput value={name} onChange={event => setName(event.target.value)} placeholder="New tag name" />
            </TableCell>
            <TableCell />
            <TableCell />
            <TableCell>
                <Button
                    label="Save"
                    onClick={async () => {
                        const response = await useCreateTag({
                            data: {
                                name,
                            },
                        });
                        if (response.status === 201) {
                            await close(response.data);
                        } else {
                            logger.warn('Error Saving new Tag', {
                                status: response.status,
                                data: response.data,
                            });
                        }
                    }}
                />
                <Button label="Cancel" onClick={() => close()} />
            </TableCell>
        </TableRow>
    );
};
