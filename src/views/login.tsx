import * as React from "react";
import { RouteComponentProps, Redirect } from "react-router-dom";

import "../style/login.css";

import Enter from "../components/login/enter";
import Create from "../components/login/createAccount";

type RouteParams = { page: "create" | undefined }

class Login extends React.Component<RouteComponentProps<RouteParams>>{

	componentDidUpdate() {
		const { params } = this.props.match;
		if (params.page != "create" && params.page != undefined) {
			this.props.history.push("/login");
		}
	}
	render() {
		const { params } = this.props.match;
		if (!params.page)
			return <Enter />
		else if (params.page == "create")
			return <Create route={(route) => {
				this.props.history.push(route);
				console.log(route);
			}} />
	}
}

export default Login;