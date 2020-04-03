import * as React from "react";
import { Link } from "react-router-dom";
import { Auth } from "../../main";

type State = {
    email: string;
    password: string;
}

class Enter extends React.Component<any, State>{

    state: State = {
        email: "",
        password: ""
    }


    validation() {
        const { email, password } = this.state
        const valideEmail = email.match(/^.+@.+\.[a-z]*$/);
        return valideEmail && password.trim();
    }

    error(msg?: string) {
        alert(msg || "error");
    }

    submit() {
        const { email, password } = this.state
        if (this.validation())
            Auth.signInWithEmailAndPassword(email.trim(), password.trim())
                .catch(({ message }) => this.error(message))
        else this.error();
    }

    render() {
        const { email, password } = this.state
        const validation = this.validation();
        return (
            <div id="login">
                <h1>Login</h1>
                <div id="inputs">
                    <div>
                        <label>email</label>
                        <input type="mail"
                            value={email}
                            onChange={e => this.setState({ email: e.target.value })}
                            placeholder="your email"
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
                </div>
                <div id="tools">
                    <button
                        onClick={() => this.submit()}
                        disabled={!validation}
                    >login</button>

                    <Link to="login/create">create account</Link>
                </div>
            </div>
        )
    }
}

export default Enter;