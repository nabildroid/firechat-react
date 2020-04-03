import * as React from "react";;
import { UserContext } from "../../contexts";
import { User } from "@firebase/auth-types";

type State = {
    password: string;
    rewrite: string;
    updating: boolean;
}
class Password extends React.Component<any, State>{
    context: User;
    static contextType = UserContext;

    state: State = {
        password: "",
        rewrite: "",
        updating: false
    }
    changeValue(key: "password" | "rewrite") {
        const { value } = event.target as HTMLInputElement;
        const insert = {};
        insert[key] = value;
        this.setState(insert);
    }

    validation() {
        const { password, rewrite, updating } = this.state;
        return !updating && password.trim().length > 6 && password == rewrite;
    }
    update() {
        const { password } = this.state;
        if (this.validation()) {
            this.setState({ updating: true })
            this.context.updatePassword(password)
                .finally(() => {
                    this.setState({ updating: false })
                })
        }
    }
    render() {
        const { password, rewrite, updating } = this.state;
        const validation = this.validation();
        return (
            <div id="section">
                <div id="inputs">
                    <div>
                        <h1>new password</h1>
                        <div>
                            <input type="password"
                                value={password}
                                onChange={this.changeValue.bind(this, "password")}
                                placeholder="******" />
                            <label>rewrite</label>
                            <input type="password"
                                value={rewrite}
                                onChange={this.changeValue.bind(this, "rewrite")}
                                placeholder="******" />
                        </div>
                    </div>
                </div>
                <div id="tool">
                    <button
                        disabled={!validation}
                        onClick={() => this.update()}
                    >{updating ? "updating" : "update"}</button>
                </div>
            </div>
        )
    }
}

export default Password;