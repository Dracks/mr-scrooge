import { Box, Footer, Main, Text } from 'grommet';
import React from 'react';
import { Route, Routes } from 'react-router-dom';

import { VERSION } from '../constants';
import { AdminContent } from './admin/admin-content';
import { DataProvider } from './common/data-provider';
import NotFound from './extra/not-found';
import { GraphRouter } from './graphs/graph-router';
import { Graphs } from './graphs/graphs';
import Headers from './headers';
import { Imports } from './imports/imports';
import { LabelsList } from './labels/labels-list';
import { EditProfile } from './profile/edit-profile';
import { RulesLoaded } from './rules/rule-loaded';
import { TransactionList } from './transaction-list/transaction-list';

const RestrictedContent: React.FC = () => (
    <DataProvider>
        <Headers />
        <Main>
            <Routes>
                <Route path="" element={<Graphs />} />
                <Route path="/graph/*" element={<GraphRouter />} />
                <Route path="/import/*" element={<Imports />} />
                <Route path="/movement" element={<TransactionList />} />
                <Route path="/label/*" element={<LabelsList />} />
                <Route path="/profile" element={<EditProfile />} />
                <Route path="/admin/*" element={<AdminContent />} />
                <Route path="/rule/*" element={<RulesLoaded />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </Main>
        <Footer background="light-2" pad="medium">
            <Box fill align="center">
                <Text size="small" textAlign="center">
                    Mr Scrooge by Jaume Singla Valls
                </Text>
                <Text size="small" textAlign="center">
                    version {VERSION}
                </Text>
            </Box>
        </Footer>
    </DataProvider>
);

export default RestrictedContent;
