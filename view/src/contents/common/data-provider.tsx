import React from 'react';

import { ProvideRdsData } from './raw-data-source.context';
import { ProvideTagsData } from './tag.context';
import { ProvideUploadQueue } from './uploader-queue.context';

export const DataProvider: React.FC = ({ children }) => (
    <ProvideTagsData>
        <ProvideRdsData>
            <ProvideUploadQueue>{children}</ProvideUploadQueue>
        </ProvideRdsData>
    </ProvideTagsData>
);
