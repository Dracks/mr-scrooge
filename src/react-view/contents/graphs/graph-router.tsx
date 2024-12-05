import React from 'react';
import { Route, Routes } from 'react-router';

import { AddRouteParams, routeParamsIsParamId } from '../../utils/add-router-params';
import { EditGraph } from './form/edit-graph.form';
import { GraphNew } from './form/new-graph.form';

export const GraphRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="new-graph" element={<GraphNew />} />
            <Route path=":id" element={<AddRouteParams
                check={routeParamsIsParamId}
                child={({ id }) => <EditGraph id={id} />} 
            /> } />
        </Routes>
    );
};
