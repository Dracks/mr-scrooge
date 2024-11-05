import React, { PropsWithChildren } from 'react';

import { ProvideLabelsData } from './label.context';
import { ProvideTransactionsData } from './transaction.context';
import { ProvideUploadQueue } from './uploader-queue.context';

export const DataProvider: React.FC<PropsWithChildren> = ({ children }) => (
    <ProvideLabelsData>
        <ProvideTransactionsData>
            <ProvideUploadQueue>{children}</ProvideUploadQueue>
        </ProvideTransactionsData>
    </ProvideLabelsData>
);
