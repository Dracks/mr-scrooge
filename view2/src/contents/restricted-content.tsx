import React from 'react'
import { Footer, Text, Main, Box } from 'grommet'
import { Route, Routes } from 'react-router-dom'

import NotFound from './extra/not-found'
import Headers from './headers'
import { RawDataList } from './raw-data-list/raw-data-list'
import { DataProvider } from './common/data-provider'

const RestrictedContent: React.FC = () => (
    <DataProvider>
        <Headers />
        <Main>
            <Routes>
                <Route path="/import" element={} />
                <Route path="/movement" element={<RawDataList />} /> 
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Main>

        <Footer background="light-2" pad="medium">
            <Box fill align="center">
                <Text size="xsmall" textAlign="center">
                    Mr Scrooge by Jaume Singla Valls
                </Text>
            </Box>
        </Footer>
    </DataProvider>
        
)

export default RestrictedContent;

