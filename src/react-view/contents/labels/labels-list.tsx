import { Box, Tag } from 'grommet';
import React from 'react';

import { useUserGroupsMap } from '../../utils/session/session-context';
import { useLabelsListContext } from '../common/label.context';

export const LabelsList: React.FC = () => {
    const labels = useLabelsListContext();
    const groups = useUserGroupsMap();

    return (
        <Box direction="row" align="center" pad="small" gap="small">
            {labels.map(label => (
                <Tag
                    key={label.id}
                    name={groups.get(label.groupOwnerId)?.name ?? ''}
                    value={label.name}
                    align="center"
                />
            ))}
        </Box>
    );
};
