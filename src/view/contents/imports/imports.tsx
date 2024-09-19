import { Box, Nav, Sidebar } from 'grommet';
import { Icon, StatusCritical, StatusGood, StatusWarning } from 'grommet-icons';
import React from 'react';
import { Route, Routes, useParams } from 'react-router';

import { useGetImportStatusQuery, GQLImportStatus } from '../../api/graphql/generated';
import { useLogger } from '../../utils/logger/logger.context';
import { EventTypes, useEventEmitter } from '../../utils/providers/event-emitter.provider';
import { AnchorLink } from '../../utils/ui/anchor-link';
import Loading from '../../utils/ui/loading';
import NotFound from '../extra/not-found';
import { ImportDetails } from './details/details';
import { ImportWizard } from './wizard/import-wizard';

const STATUS_MAP_ICON: Record<GQLImportStatus['status'], { color: string; icon: Icon }> = {
    e: { icon: StatusCritical, color: 'status-error' },
    o: { icon: StatusGood, color: 'status-ok' },
    w: { icon: StatusWarning, color: 'status-warning' },
};

const ImportDetailsSwitcher: React.FC<{ importsList: GQLImportStatus[] }> = ({ importsList }) => {
    const { id } = useParams();
    const statusList = importsList.find(status => status.id === Number.parseInt(id ?? 'NaN', 10));

    return statusList ? <ImportDetails status={statusList} /> : <NotFound />;
};

const ImportsList: React.FC<{ importsList: GQLImportStatus[] }> = ({ importsList }) => {
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
                        <AnchorLink to={`${impFile.id}`} style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {impFile.fileName}
                        </AnchorLink>
                    </Box>
                );
            })}
        </React.Fragment>
    );
};

export const Imports: React.FC = () => {
    const [response, request] = useGetImportStatusQuery();
    const eventEmitter = useEventEmitter();
    const logger = useLogger();
    const importsList = response.data?.imports.results ?? [];

    React.useEffect(() => {
        const unsubscribe = eventEmitter.subscribe(EventTypes.OnFileUploaded, () => {
            request()
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
