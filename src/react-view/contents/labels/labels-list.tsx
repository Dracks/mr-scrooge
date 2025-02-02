import { Box, Tag } from 'grommet';
import React, { useState } from 'react';

import { Label } from '../../api/models';
import { useUserGroupsMap } from '../../utils/session/session-context';
import { useLabelsListContext } from '../common/label.context';
import { EditLabelModal } from './edit-label';
import { NewLabelModal } from './new-label';

export const LabelsList: React.FC = () => {
    const labels = useLabelsListContext();
    const groups = useUserGroupsMap();
    const [editing, setEditing] = useState<Label | undefined>();
    const [showNew, setShowNew] = useState<boolean>(false)

    return (
        <>
            {editing ? (
                <EditLabelModal
                    label={editing}
                    onClose={() => {
                        setEditing(undefined);
                    }}
                />
            ) : undefined}
            {showNew ? (
                <NewLabelModal onClose={(label)=>{
                    setShowNew(false)
                    if (label){
                        setEditing(label)
                    }
                }} />
            ): undefined}
            <Box
                direction="row"
                align="center"
                pad="small"
                gap="small"
                wrap={true}
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                }}
            >
                {labels.map(label => (
                    <Tag
                        key={label.id}
                        name={groups.get(label.groupOwnerId)?.name ?? ''}
                        value={label.name}
                        align="center"
                        margin="xxsmall"
                        onClick={() => {
                            setEditing(label);
                        }}
                    />
                ))}
                <Tag value="add" onClick={()=>{setShowNew(true)}}/>
            </Box>
        </>
    );
};
