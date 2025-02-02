import React from 'react';
import { Route, Routes } from 'react-router';

import { AddRouteParams, routeParamsIsParamId } from '../../utils/add-router-params';
import { EditRule } from './edit-rule';
import { NewRuleForm } from './new-rule';
import { RuleList } from './rule-list';

export const RuleRouter: React.FC = () => {
    return (
        <Routes>
            <Route path="new-rule" element={<NewRuleForm />} />
            <Route
                path=":id"
                element={<AddRouteParams check={routeParamsIsParamId} child={({ id }) => <EditRule id={id} />} />}
            />
            <Route path="" element={<RuleList />} />
        </Routes>
    );
};
