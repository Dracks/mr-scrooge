import { Box, Nav, Sidebar, Text } from 'grommet';
import React from 'react';
import { Route, Routes, useParams } from 'react-router';

import { StatusReport } from '../../api/client/imports/types';
import { useGetImports } from '../../api/client/imports/use-get-imports';
import { useLogger } from '../../utils/logger/logger.context';
import { EventTypes, useEventEmitter } from '../../utils/providers/event-emitter.provider';
import { AnchorLink } from '../../utils/ui/anchor-link';
import Loading from '../../utils/ui/loading';
import NotFound from '../extra/not-found';
import { ImportDetails } from './details/details';
import { ImportWizard } from './wizard/import-wizard';

const ImportDetailsSwitcher: React.FC<{ importsList: StatusReport[] }> = ({ importsList }) => {
    const { id } = useParams();
    const statusList = importsList.find(status => status.id === Number.parseInt(id ?? 'NaN', 10));

    return statusList ? <ImportDetails status={statusList} /> : <NotFound />;
};

export const Imports: React.FC = () => {
    const [response, request] = useGetImports();
    const eventEmitter = useEventEmitter();
    const logger = useLogger();
    const importsList = response.data ?? [];

    React.useEffect(() => {
        const unsubscribe = eventEmitter.subscribe(EventTypes.OnFileUploaded, () => {
            request().catch(error => logger.error('Some error reloading the imports', { error }));
        });

        return unsubscribe;
    }, []);

    return (
        <Box direction="row">
            <Sidebar background="neutral-2">
                <Nav>
                    <Box pad="small">
                        <AnchorLink to="">Wizard</AnchorLink>
                    </Box>
                    {importsList.length === 0 ? (
                        <Loading />
                    ) : (
                        importsList.map(impFile => (
                            <Box pad="small" key={impFile.id}>
                                <AnchorLink to={`${impFile.id}`}>
                                    <Text truncate="tip">{impFile.fileName}</Text>
                                </AnchorLink>
                            </Box>
                        ))
                    )}
                </Nav>
            </Sidebar>
            <Box fill>
                <Routes>
                    <Route path="" element={<ImportWizard />} />
                    <Route path=":id" element={<ImportDetailsSwitcher importsList={importsList} />} />
                </Routes>
            </Box>
        </Box>
    );
};
