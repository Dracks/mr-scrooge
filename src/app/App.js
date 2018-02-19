import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import RawDataPage from './Pages/RawDataPage';
import GraphReportPage from './Pages/GraphReportPage';


class App extends Component {
  render() {
    return (
      <div>
        <Header />
        <Switch>
            <Route
                path="/"
                exact
                component={GraphReportPage} />
            <Route
                path="/raw-data"
                component={RawDataPage}/>
        </Switch>
        <Footer />
      </div>
    );
  }
}

export default App;
