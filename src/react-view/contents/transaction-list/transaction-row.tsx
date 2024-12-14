import { format } from 'date-fns';
import { TableCell, TableRow, TextArea } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApi } from '../../api/client';
import { ApiUUID, BankTransaction, Label } from '../../api/models';
import { useLogger } from '../../utils/logger/logger.context';
import { catchAndLog } from '../../utils/promises';
import { InputTag } from '../../utils/ui/tag/input-tag';
import { BankTransactionEnriched } from '../common/transaction.context';

interface TransactionRowProps {
    labels: Label[];
    onChange: (newData: BankTransaction) => void;
    transaction: BankTransactionEnriched;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, labels, onChange }) => {
    const logger = useLogger("Transaction row")
    const client = useApi()
    const linkTags = useAsyncCallback((transactionId: ApiUUID, labelId: ApiUUID)=>client.POST("/bank-transactions/{transactionId}/label/{labelId}", {params: {path: {transactionId, labelId}}}))
    const unlinkTags = useAsyncCallback((transactionId: ApiUUID, labelId: ApiUUID)=>client.DELETE("/bank-transactions/{transactionId}/label/{labelId}", {params: {path: {transactionId, labelId}}}))

    const setComment = useAsyncCallback((transactionId: ApiUUID, comment?: string) => client.PATCH("/bank-transactions/{transactionId}", {body: {comment}, params: {path: {transactionId}}}))
    const { labelIds } = transaction;
    const updateRdsTag = async (action: "link" | "unlink", labelId: ApiUUID) => {
        onChange({
            ...transaction,
            date: transaction.date.toISOString(),
            labelIds:
                action === "unlink" ? labelIds.filter(id => id !== labelId) : [...labelIds, labelId],
        });
        const request = await (action === "unlink" ? unlinkTags : linkTags).execute(transaction.id, labelId);
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
        const request = await setComment.execute(transaction.id, desc.length >0 ? desc : undefined);
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
                    onAdd={tag => {catchAndLog(updateRdsTag("link", tag.id), "Linking a tag", logger)}}
                    onRemove={tag => { catchAndLog(updateRdsTag("unlink", tag.id), "Unlinking a tag", logger) }}
                    suggestions={labels.filter(tag => !transaction.labelsComplete.includes(tag))}
                />
            </TableCell>
            <TableCell>{transaction.movementName}</TableCell>
            <TableCell>{transaction.value}</TableCell>
            <TableCell>{format(transaction.date, 'yyyy-MM-dd')}</TableCell>
            <TableCell>
                <TextArea value={transaction.description ?? undefined} onBlur={event => { catchAndLog(updateDesc(event.target.value), "Updating comment on transaction", logger) }} />
            </TableCell>
        </TableRow>
    );
};
