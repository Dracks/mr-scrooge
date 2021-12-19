import { Box, Text, Heading } from 'grommet'
import React from 'react'

const NotFound = () => (
    <Box
        direction="column"
        border={{ color: 'brand', size: 'large' }}
        pad="medium"
    >
        <Heading>Not Found</Heading>
        <Box pad="medium" background="light-3">
            <Text></Text>
        </Box>
    </Box>
)

export default NotFound
