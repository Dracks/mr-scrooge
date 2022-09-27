import React from 'react';
import { Route, Routes } from 'react-router';

import { TagEdit } from './edit-tag/edit-tag';
import { TagsList } from './list-tags';

export const Tags: React.FC<{}> = () => {
    return (
        <Routes>
            <Route path="" element={<TagsList />} />
            <Route path=":id" element={<TagEdit />} />
        </Routes>
    );
};
