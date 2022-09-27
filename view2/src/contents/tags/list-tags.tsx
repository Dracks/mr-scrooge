import { Button, InfiniteScroll, Table, TableBody, TableCell, TableHeader, TableRow } from 'grommet';
import { Add } from 'grommet-icons';
import React from 'react';

import { Tag } from '../../api/client/tag/types';
import { useTagsContext } from '../common/tag.context';
import { NewTagRow } from './new-tag-row';
import { TagListRow } from './tag-list-row';

export const TagsList: React.FC = () => {
    const [isAdding, setIsAdding] = React.useState(false);
    const { tags, tagsMap: tagsHash, refresh } = useTagsContext();

    const onClose = React.useCallback(
        async (newTag?: Tag) => {
            if (newTag) {
                await refresh();
            }
            setIsAdding(false);
        },
        [setIsAdding, refresh],
    );

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableCell scope="col" border="bottom">
                        parent
                    </TableCell>
                    <TableCell scope="col" border="bottom">
                        Tag name
                    </TableCell>
                    <TableCell>condition handler</TableCell>
                    <TableCell># conditions</TableCell>
                    <TableCell>
                        Actions <Button icon={<Add size="small" />} onClick={() => setIsAdding(true)} />
                    </TableCell>
                </TableRow>
            </TableHeader>
            <TableBody>
                {isAdding ? <NewTagRow close={onClose} /> : undefined}
                <InfiniteScroll items={tags}>
                    {(result: Tag) => <TagListRow key={result.id} tag={result} tagHash={tagsHash} refresh={refresh} />}
                </InfiniteScroll>
            </TableBody>
        </Table>
    );
};
