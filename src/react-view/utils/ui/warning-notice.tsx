import { Box } from 'grommet';
import React from 'react';

export const WarningNotice: React.FC<React.PropsWithChildren> = ({ children }) => (
    <Box border={{ color: 'accent-4', size: 'small' }}>{children}</Box>
);
