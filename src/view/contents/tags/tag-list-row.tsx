import { Button, TableCell, TableRow } from 'grommet';
import React from 'react';
import { useNavigate } from 'react-router';
import { UUID } from 'short-uuid';

import { Tag } from '../../api/client/tag/types';
import { useDeleteTag } from '../../api/client/tag/use-delete-tag';
import { useLogger } from '../../utils/logger/logger.context';
import { ConfirmationButton } from '../../utils/ui/confirmation-button';

interface TagListRowArgs {
    refresh: () => void;
    tag: Tag;
    tagHash: Record<UUID, Tag>;
}

export const TagListRow: React.FC<TagListRowArgs> = ({ tag, tagHash, refresh }) => {
    const [, deleteRequest] = useDeleteTag(tag.id);
    const navigate = useNavigate();
    const parentTag = tag.parent ? tagHash[tag.parent] : { name: undefined };
    const logger = useLogger();
    return (
        <TableRow>
            <TableCell>{parentTag.name}</TableCell>
            <TableCell>{tag.name}</TableCell>
            <TableCell>{tag.negateConditional ? 'not and' : 'or'}</TableCell>
            <TableCell>{tag.filters.length}</TableCell>
            <TableCell>
                <Button
                    primary
                    label="Edit"
                    onClick={() => {
                        navigate(`${tag.id}`);
                    }}
                />
                <ConfirmationButton
                    label="Delete"
                    color="accent-4"
                    onConfirm={() => {
                        deleteRequest().then(refresh, error => logger.error('Error on delete tag', { error }));
                    }}
                />
            </TableCell>
        </TableRow>
    );
};
