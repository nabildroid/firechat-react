import * as React from "react";
import { Link, RouteComponentProps } from "react-router-dom";

import { Auth } from "../../main";

type State = {
    email: string;
    password: string;
    password1: string;
}
type Props = {
    route: (path) => void
}


class Create extends React.Component<Props, State>{
    state: State = {
        email: "",
        password: "",
        password1: "",
    }

    validation() {
        const { email, password, password1 } = this.state
        const valideEmail = email.match(/^.+@.+\.[a-z]*$/);
        return email != "" && valideEmail && password != "" && password === password1;
    }

    error(msg?: string) {
        alert(msg || "error");
    }
    submit() {
        const { email, password } = this.state
        if (this.validation())
            Auth.createUserWithEmailAndPassword(email, password)
                .then(user => {
                    if (user.additionalUserInfo.isNewUser) {
                        setTimeout(() =>
                            this.props.route("/profile/setting"),
                            2000
                        );
                    }
                });

        else this.error()
    }

    render() {
        const { email, password, password1 } = this.state
        const validation = this.validation();
        return (
            <div id="login">
                <h1>create account</h1>
                <div id="inputs">
                    <div>
                        <label>email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={e => this.setState({ email: e.target.value })}
                            placeholder="email"
                        />
                    </div>
                    <div>
                        <label>password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => this.setState({ password: e.target.value })}
                            placeholder="*****"
                        />
                    </div>
                    <div>
                        <label>repeat password</label>
                        <input
                            type="password"
                            value={password1}
                            onChange={e => this.setState({ password1: e.target.value })}
                            placeholder="*****"
                        />
                    </div>
                </div>
                <div id="tools">
                    <button
                        onClick={() => this.submit()}
                        disabled={!validation}
                    >create</button>

                    <Link to="/login">Login</Link>
                </div>
            </div>
        )
    }
}

export default Create;