import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import GraphReportPage from './Pages/GraphReportPage';
import ImportPage from './Pages/ImportPage';
import RawDataPage from './Pages/RawDataPage';
import TagPage from './Pages/TagPage';


const Contents = () => {
    return (
      <div>
        <Switch>
            <Route
                path="/"
                exact={true}
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
