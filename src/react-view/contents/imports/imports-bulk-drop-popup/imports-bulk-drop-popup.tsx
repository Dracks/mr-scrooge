import { Box } from 'grommet';
import React, { useState } from 'react';

import type { FileImport } from '../../../api/models';
import { ImportBulkDropList } from './imports-bulk-drop-list';
import { ImportBulkDropProgress } from './imports-bulk-drop-progress';

interface ImportBulkDropPopupProps {
    imports: FileImport[];
    onClose: () => void;
    onDone: () => void;
}

export const ImportBulkDropPopup: React.FC<ImportBulkDropPopupProps> = ({ imports, onClose, onDone }) => {
    const [phase, setPhase] = useState<{ type: 'list' } | { type: 'deleting'; ids: Set<string> }>({ type: 'list' });

    return (
        <Box pad="medium" gap="medium" width="large">
            {phase.type === 'list' && (
                <ImportBulkDropList
                    allImports={imports}
                    onDelete={ids => {
                        setPhase({ type: 'deleting', ids });
                    }}
                    onCancel={onClose}
                />
            )}

            {phase.type === 'deleting' && <ImportBulkDropProgress ids={phase.ids} onDone={onDone} onClose={onClose} />}
        </Box>
    );
};
