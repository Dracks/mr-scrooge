import { Box, Nav, Sidebar } from 'grommet';
import { Icon, StatusCritical, StatusGood, StatusWarning } from 'grommet-icons';
import React from 'react';
import { Route, Routes, useParams } from 'react-router';

import { useApiClient } from '../../api/client';
import { FileImport } from '../../api/models';
import { usePagination } from '../../api/pagination';
import { EventTypes, useEventEmitter } from '../../utils/providers/event-emitter.provider';
import { AnchorLink } from '../../utils/ui/anchor-link';
import Loading from '../../utils/ui/loading';
import NotFound from '../extra/not-found';
import { ImportDetails } from './details';
import { ImportWizard } from './wizard/import-wizard';

const STATUS_MAP_ICON: Record<FileImport['status'], { color: string; icon: Icon }> = {
    error: { icon: StatusCritical, color: 'status-error' },
    ok: { icon: StatusGood, color: 'status-ok' },
    warning: { icon: StatusWarning, color: 'status-warning' },
};

const ImportDetailsSwitcher: React.FC<{ importsList: FileImport[] }> = ({ importsList }) => {
    const { id } = useParams();
    const statusList = importsList.find(status => status.id === id);

    return statusList ? <ImportDetails status={statusList} /> : <NotFound />;
};

const ImportsList: React.FC<{ importsList: FileImport[] }> = ({ importsList }) => {
    if (importsList.length === 0) {
        return <Loading />;
    }
    return (
        <React.Fragment>
            {importsList.map(impFile => {
                const { icon: StatusIcon, color: iconColor } = STATUS_MAP_ICON[impFile.status];
                return (
                    <Box pad="small" key={impFile.id} direction="row" align="center">
                        <StatusIcon color={iconColor} />
                        <AnchorLink to={`/import/${impFile.id}`} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {impFile.fileName}
                        </AnchorLink>
                    </Box>
                );
            })}
        </React.Fragment>
    );
};

export const Imports: React.FC = () => {
    // const logger = useLogger("Imports");
    const client = useApiClient();
    const paginator = usePagination(
        async next => {
            const response = await client.GET('/imports', { params: { query: { cursor: next } } });
            if (response.data?.results) {
                return response.data;
            }
            throw Error('Cannot get imports');
        },
        { autostart: true, hash: (fi: FileImport) => fi.id },
    );
    const eventEmitter = useEventEmitter();
    const importsList = paginator.loadedData;

    React.useEffect(() => {
        const unsubscribe = eventEmitter.subscribe(EventTypes.OnFileUploaded, () => {
            paginator.reset(true);
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
                    <ImportsList importsList={importsList} />
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
