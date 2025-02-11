import { Box, Layer, Tag } from 'grommet';
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
    
    let modal : React.ReactElement | undefined = undefined
    if (editing || showNew){
        const onClose = () => { setEditing(undefined);  setShowNew(false) }
        modal = <Layer onEsc={() => { onClose() }} onClickOutside={() => { onClose() }} modal position="center">
            { editing ?                 
                <EditLabelModal
                label={editing}
                onClose={() => {
                    setEditing(undefined);
                }}
            /> : undefined }
            { showNew ?  <NewLabelModal onClose={(label)=>{
                if (label){
                    setEditing(label)
                }
                setShowNew(false)
            }} /> : undefined }
        </Layer>
    }

    return (
        <>
            {modal}
            <Box
                direction="row"
                align="center"
                pad="small"
                gap="small"
                wrap={true}
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
