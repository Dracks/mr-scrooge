import { format } from 'date-fns';
import { TableCell, TableRow, TextArea } from 'grommet';
import React from 'react';
import { useAsyncCallback } from 'react-async-hook';

import { useApi } from '../../api/client';
import { ApiUUID, BankTransaction, Label } from '../../api/models';
import { useLogger } from '../../utils/logger/logger.context';
import { catchAndLog } from '../../utils/promises';
import { LabelInput } from '../../utils/ui/label-selector';
import { BankTransactionEnriched } from '../common/transaction.context';

interface TransactionRowProps {
    labels: Label[];
    onChange: (newData: BankTransaction) => void;
    transaction: BankTransactionEnriched;
}

export const TransactionRow: React.FC<TransactionRowProps> = ({ transaction, labels, onChange }) => {
    const logger = useLogger("Transaction row")
    const client = useApi()
    const linkLabel = useAsyncCallback((transactionId: ApiUUID, labelId: ApiUUID)=>client.POST("/bank-transactions/{transactionId}/label/{labelId}", {params: {path: {transactionId, labelId}}}))
    const unlinkLabel = useAsyncCallback((transactionId: ApiUUID, labelId: ApiUUID)=>client.DELETE("/bank-transactions/{transactionId}/label/{labelId}", {params: {path: {transactionId, labelId}}}))

    const setComment = useAsyncCallback((transactionId: ApiUUID, comment?: string) => client.PATCH("/bank-transactions/{transactionId}", {body: {comment}, params: {path: {transactionId}}}))

    const { labelIds } = transaction;
    const updateTransactionLabel = (action: "link" | "unlink", labelId: ApiUUID) => {
        onChange({
            ...transaction,
            date: transaction.date.toISOString(),
            labelIds:
                action === "unlink" ? labelIds.filter(id => id !== labelId) : [...labelIds, labelId],
        });
        
        const updatePromise = (action === "unlink" ? unlinkLabel : linkLabel).execute(transaction.id, labelId).then(request => {
            console.log(request)
            //onChange(request.data);
        });
        catchAndLog(updatePromise, `Problem ${action} a label from a transaction`, logger)
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
    };
    useLogger().info('raw data source', { rds: transaction });
    return (
        <TableRow>
            <TableCell>{transaction.kind}</TableCell>
            <TableCell>
                <LabelInput
                    value={transaction.labelsComplete}
                    onAdd={tag => {updateTransactionLabel("link", tag.id)}}
                    onRemove={tag => { updateTransactionLabel("unlink", tag.id) }}
                    suggestions={labels.filter(tag => !transaction.labelsComplete.includes(tag))}
                />
            </TableCell>
            <TableCell>{transaction.movementName}</TableCell>
            <TableCell>{transaction.value}</TableCell>
            <TableCell>{format(transaction.date, 'yyyy-MM-dd')}</TableCell>
            <TableCell>
                <TextArea defaultValue={transaction.description ?? ""} onBlur={event => { catchAndLog(updateDesc(event.target.value), "Updating comment on transaction", logger) }} />
            </TableCell>
        </TableRow>
    );
};
