import { Box, Button, Heading } from 'grommet';
import { Add } from 'grommet-icons';
import React from 'react';
import { useNavigate } from 'react-router';

export const AddGraphPlaceholder = () => {
    const navigate = useNavigate();
    return (
        <Box direction="column" pad="small">
            <Heading level={3}>Add a new graph</Heading>
            <Box height={'400px'} width="fill" background="light-2" justify="center" align="center">
                <Button
                    icon={<Add size="large" />}
                    onClick={() => {
                        navigate(`/graph/new-graph`);
                    }}
                />
            </Box>
        </Box>
    );
};
