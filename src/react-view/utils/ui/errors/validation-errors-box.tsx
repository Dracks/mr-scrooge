import { Box, Heading, Text } from 'grommet';
import React from 'react';
import { z } from 'zod';

export const ValidationErrorsBox: React.FC<{ title: string; errors: z.ZodError }> = ({ title, errors }) => {
    return (
        <Box pad="medium" background="status-critical" round>
            <Heading level="4" color="white">
                {title}
            </Heading>
            {errors.issues.map((error, index) => (
                <Text key={index} color="white">
                    {error.path.join('.')}:{error.message}
                </Text>
            ))}
        </Box>
    );
};
