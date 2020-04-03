import * as React from "react";;
import { Link } from "react-router-dom";

import {ProfileContext} from "../../contexts";
import {ProfileContextType} from "../../types";

import Info from "../../components/setting/info";
import Passsword from "../../components/setting/password";

import "../../style/setting.css";

type Sections = "info" | "password";
type State = {
    section: Sections;
}
class Chat extends React.Component<any, State>{
    context:ProfileContextType;
    static contextType = ProfileContext;
    state: State = {
        section: "info"
    }

    changeSection(section: Sections) {
        this.setState({ section });
    }
    render() {
        const [profile] = this.context;
        const { section } = this.state;

        return (
            <div id="setting">
                <header>
                    <img src={profile.picture} />
                    <b>{profile.name}</b>
                </header>
                <div id="sections">
                    <div id="tool">
                        <button 
                            className={section == "info" ? "active" : ""}
                            onClick = {()=>this.setState({section:"info"})}
                        >
                            info
                        </button>
                        <button 
                            className={section == "password" ? "active" : ""}
                            onClick = {()=>this.setState({section:"password"})}
                        >
                            password
                        </button>
                    </div>
                    {section == "info" ? <Info /> : <Passsword />}
                </div>
                <div id="bottom-bar">
                    <Link to="/profile">
                        <i className="fa fa-cog fa-fw" aria-hidden="true"></i> <span>Messages</span>
                    </Link>
                    <Link to="/profile/friends" id="settings">
                        <i className="fa fa-user-plus fa-fw" aria-hidden="true"></i> <span>friends</span>
                    </Link>
                </div>
            </div>
        )
    }
}

export default Chat;