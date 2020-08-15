import React, { Component, Suspense } from 'react';
import Layout from './hoc/Layout/Layout';
import BurgerBuilder from './containers/BurgerBuilder/BurgerBuilder'
import { Route, Switch, withRouter, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import * as actions from './store/actions/index';

const Orders = React.lazy(() => import('./containers/Orders/Orders'));
const Auth = React.lazy(() => import('./containers/Auth/Auth'));
const Logout = React.lazy(() => import('./containers/Auth/Logout/Logout'));
const Checkout = React.lazy(() => import('./containers/Checkout/Checkout'));

class App extends Component {
  componentDidMount() {
    this.props.onTryAutoSignup();
  }
  render() {

    let routes = (
      <Switch>
        <Route path="/auth" render={() => <Suspense fallback={<div>Loading...</div>}><Auth /></Suspense>} />
        <Route path="/" exact component={BurgerBuilder} />
        <Redirect to="/" />
      </Switch>

    );

    if (this.props.isAuthenticated) {
      routes = (
        <Switch>
          <Route path="/auth" render={() => <Suspense fallback={<div>Loading...</div>}><Checkout /></Suspense>} />
          <Route path="/orders" render={() => <Suspense fallback={<div>Loading...</div>}><Orders /></Suspense>} />
          <Route path="/logout" render={() => <Suspense fallback={<div>Loading...</div>}><Logout /></Suspense>} />
          <Route path="/auth" render={() => <Suspense fallback={<div>Loading...</div>}><Auth /></Suspense>} />
          <Route path="/" exact component={BurgerBuilder} />
          <Redirect to="/" />
        </Switch>
      );
    }
    return (
      <div>
        <Layout>
          {routes}
        </Layout>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    isAuthenticated: state.auth.token !== null
  }
}
const mapDispatchToProps = dispatch => {
  return {
    onTryAutoSignup: () => dispatch(actions.authCheckState())
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
