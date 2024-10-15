import { format } from 'date-fns';
import { TableCell, TableRow, TextArea } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApi } from '../../api/client';
import { ApiUUID, BankTransaction, Label } from '../../api/models';
import { useLogger } from '../../utils/logger/logger.context';
import { InputTag } from '../../utils/ui/tag/input-tag';
import { BankTransactionEnriched } from '../common/transaction.context';

interface TransactionRowProps {
    labels: Label[];
    onChange: (newData: BankTransaction) => void;
    transaction: BankTransactionEnriched;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, labels, onChange }) => {
    const client = useApi()
    const linkTags = useAsyncCallback((labelId: ApiUUID)=>client.POST("/bank-transactions/{transactionId}/label/{labelId}", {params: {path: {transactionId: transaction.id, labelId}}}))
    const unlinkTags = useAsyncCallback((labelId: ApiUUID)=>client.DELETE("/bank-transactions/{transactionId}/label/{labelId}", {params: {path: {transactionId: transaction.id, labelId}}}))

    const setComment = useAsyncCallback((comment: string) => Promise.resolve(transaction))
    const { labelIds } = transaction;
    const updateRdsTag = async (action: "link" | "unlink", labelId: number) => {
        onChange({
            ...transaction,
            date: transaction.date.toISOString(),
            labelIds:
                action === "unlink" ? labelIds.filter(id => id !== labelId) : [...labelIds, labelId],
        });
        const request = await (action === "unlink" ? unlinkTags : linkTags).execute(labelId);
        console.log(request)
        //onChange(request.data);
    };

    const updateDesc = async (desc: string) => {
        onChange({
            ...transaction,
            labelIds,
            date: transaction.date.toISOString(),
            description: desc,
        });
        const request = await setComment.execute(desc);
        console.log(request)
        //onChange(request.data);
    };
    useLogger().info('raw data source', { rds: transaction });
    return (
        <TableRow>
            <TableCell>{transaction.kind}</TableCell>
            <TableCell>
                <InputTag
                    value={transaction.labelsComplete}
                    onAdd={tag => {updateRdsTag("link", tag.id)}}
                    onRemove={tag => { updateRdsTag("unlink", tag.id) }}
                    suggestions={labels.filter(tag => !transaction.labelsComplete.includes(tag))}
                />
            </TableCell>
            <TableCell>{transaction.movementName}</TableCell>
            <TableCell>{transaction.value}</TableCell>
            <TableCell>{format(transaction.date, 'yyyy-MM-dd')}</TableCell>
            <TableCell>
                <TextArea value={transaction.description ?? undefined} onBlur={event => updateDesc(event.target.value)} />
            </TableCell>
        </TableRow>
    );
};
