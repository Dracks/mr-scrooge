import { Box, Heading } from "grommet";
import { Add } from "grommet-icons";
import React from "react";

export const AddGraphPlaceholder = () => <Box direction='column' pad='small'>
    <Heading level={3}>
        Add a new graph
    </Heading>
    <Box height={"400px"} width="fill" background='light-2' justify="center" align="center">
        <Add size="large"/>
    </Box>
</Box>