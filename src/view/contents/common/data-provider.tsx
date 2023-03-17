import React, { PropsWithChildren } from 'react';

import { ProvideLabelsData } from './label.context';
import { ProvideRdsData } from './raw-data-source.context';
import { ProvideUploadQueue } from './uploader-queue.context';

export const DataProvider: React.FC<PropsWithChildren> = ({ children }) => (
    <ProvideLabelsData>
        <ProvideRdsData>
            <ProvideUploadQueue>{children}</ProvideUploadQueue>
        </ProvideRdsData>
    </ProvideLabelsData>
);
