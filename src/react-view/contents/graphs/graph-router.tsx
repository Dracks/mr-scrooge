import React from 'react';
import { Route, Routes, useParams } from 'react-router';

import NotFound from '../extra/not-found';
import { EditGraph } from './form/edit-graph.form';
import { GraphNew } from './form/new-graph.form';

const EditGraphWithRoute = () => {
    const { id } = useParams<{ id: string }>();

    if (id) {
        return <EditGraph id={id} />;
    }
    return <NotFound />;
};

export const GraphRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="new-graph" element={<GraphNew />} />
            <Route path=":id" element={<EditGraphWithRoute />} />
        </Routes>
    );
};
