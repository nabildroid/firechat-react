import * as React from "react";
import { Link } from "react-router-dom"
import { UserContext } from "../contexts";

import "../style/walcome.css";
const Walcome = (props) => {
	const [redirect, changeRedirect] = React.useState<"login" | "profile">("login");
	const user = React.useContext(UserContext);

	React.useEffect(() =>
		changeRedirect(user ? "profile" : "login"),
		[user]
	)

	return (
		<div className="walcome">
			<h1>Walcome</h1>
			<Link to={redirect}>
				{redirect}
			</Link>

		</div>
	);
};


export default Walcome;



