import * as React from "react";
import { HashRouter as Router, Route, Switch, Redirect } from 'react-router-dom';

import { User } from "@firebase/auth-types";
import { Auth } from "./main";
import { UserContext } from "./contexts";

import Walcome from "./views/walcome";
import Login from "./views/login";
import Profile from "./views/profile";


import "./style/app.css";
type State = {
	user: User;
}
class App extends React.Component<any, State>{

	state: State = {
		user: null
	}
	componentDidMount() {
		Auth.onAuthStateChanged(user => this.setState({ user: user || undefined }))
	}

	render() {
		const { user } = this.state;
		console.log(user);
		return (
			user !== null &&
			<UserContext.Provider value={user}>
				<Router>
					<div id="app">
						<Switch>
							<Route path="/" exact component={Walcome} />
							{!user && <Route path="/login/:page?" exact component={Login} />}
							{user && <Route path="/profile/:page?" exact component={Profile} />}
							<Route path="*">
								<Redirect to="/" />
							</Route>
						</Switch>
					</div>
				</Router>
			</UserContext.Provider>
		)
	}
}

export default App;