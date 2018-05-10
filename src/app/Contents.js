import React from 'react';
import { Route, Switch } from 'react-router-dom';

import RawDataPage from './Pages/RawDataPage';
import GraphReportPage from './Pages/GraphReportPage';
import TagPage from './Pages/TagPage';
import ImportPage from './Pages/ImportPage';


const Contents = () => {
    return (
      <div>
        <Switch>
            <Route
                path="/"
                exact
                component={GraphReportPage} />
            <Route
                path="/raw-data"
                component={RawDataPage}/>
            <Route
                path="/tag"
                component={TagPage} />
            <Route
                path="/import"
                component={ImportPage} />
        </Switch>
      </div>
    );
}

export default Contents
