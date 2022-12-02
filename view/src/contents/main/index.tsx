import { Grid, ResponsiveContext } from 'grommet';
import React from 'react';

import { LastFiles } from '../document/last-files';
import { TagsList } from './tags-list';

export const MainPage: React.FC = () => {
    const size = React.useContext(ResponsiveContext);
    return (
        <Grid columns={size === 'small' ? '100%' : 'small'} gap="small">
            <TagsList />
            <LastFiles />
        </Grid>
    );
};
