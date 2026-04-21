import { Box, Text } from 'grommet';
import React from 'react';

import { OAuthClient } from '../../../api/models';
import { AnchorLink } from '../../../utils/ui/anchor-link';

interface OAuthAppsListParams {
    apps: OAuthClient[];
}

export const OAuthAppsList: React.FC<OAuthAppsListParams> = ({ apps }) => {
    return (
        <>
            {apps.map(app => (
                <Box pad="small" key={app.client_id} direction="row" align="center">
                    <AnchorLink
                        to={`/admin/oauth-apps/${app.client_id}`}
                        style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                        <Text truncate>{app.name}</Text>
                    </AnchorLink>
                </Box>
            ))}
        </>
    );
};
