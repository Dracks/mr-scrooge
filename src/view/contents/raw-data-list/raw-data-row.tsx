import { format } from 'date-fns';
import { TableCell, TableRow, TextArea } from 'grommet';
import React from 'react';

import { RdsLinkTagAction, useRdsAddTag } from '../../api/client/raw-data-source/use-rds-add-tag';
import { useRdsSetDescription } from '../../api/client/raw-data-source/use-rds-set-description';
import { GQLBankTransaction, GQLLabel } from '../../api/graphql/generated';
import { useLogger } from '../../utils/logger/logger.context';
import { InputTag } from '../../utils/ui/tag/input-tag';
import { TransactionsEnriched } from '../common/raw-data-source.context';

interface RawDataRowProps {
    labels: GQLLabel[];
    onChange: (newData: GQLBankTransaction) => void;
    rds: TransactionsEnriched;
}

export const RawDataRow: React.FC<RawDataRowProps> = ({ rds, labels, onChange }) => {
    const linkTags = useRdsAddTag();
    const setComment = useRdsSetDescription();
    const { labelIds } = rds;
    const updateRdsTag = async (action: RdsLinkTagAction, labelId: number) => {
        onChange({
            ...rds,
            date: rds.date.toISOString(),
            labelIds:
                action === RdsLinkTagAction.Remove ? labelIds.filter(id => id !== labelId) : [...labelIds, labelId],
        });
        const request = await linkTags(action, rds.id, labelId);
        onChange(request.data);
    };

    const updateDesc = async (desc: string) => {
        onChange({
            ...rds,
            labelIds,
            date: rds.date.toISOString(),
            description: desc,
        });
        const request = await setComment(rds.id, desc);
        onChange(request.data);
    };
    useLogger().info('raw data source', { rds });
    return (
        <TableRow>
            <TableCell>{rds.kind}</TableCell>
            <TableCell>
                <InputTag
                    value={rds.labelsComplete}
                    onAdd={tag => updateRdsTag(RdsLinkTagAction.Add, tag.id)}
                    onRemove={tag => updateRdsTag(RdsLinkTagAction.Remove, tag.id)}
                    suggestions={labels.filter(tag => !rds.labelsComplete.includes(tag))}
                />
            </TableCell>
            <TableCell>{rds.movementName}</TableCell>
            <TableCell>{rds.value}</TableCell>
            <TableCell>{format(rds.date, 'yyyy-MM-dd')}</TableCell>
            <TableCell>
                <TextArea value={rds.description ?? undefined} onBlur={event => updateDesc(event.target.value)} />
            </TableCell>
        </TableRow>
    );
};
