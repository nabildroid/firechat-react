import *  as React from "react";
import { Link } from "react-router-dom";

import { ProfileContext } from "../../contexts";
import { ProfileContextType,UserStatus } from "../../types";
import Contact from "./sidepanel/contact";
import "../../style/sidepanel.css";


type Props = {
    friendSelected: string;
    selectFriend: (uid: string) => void;
}

type State = {
    dropdown: {
        status: boolean,
        links: boolean
    },
    status: string[],
    links: string[],
    search: string
}
class Sidepanel extends React.Component<Props, State>{
    static contextType = ProfileContext;
    context: ProfileContextType;
    state: State = {
        dropdown: {
            status: false,
            links: false
        },
        status: Object.values(UserStatus),
        links: ["facebook", "twitter", "instagram"],
        search: ""
    }

    toggleDropdown(name: "status" | "links", value: boolean = null) {
        const { dropdown } = this.state;
        dropdown[name] = value !== null ? value : !dropdown[name];
        this.setState({ dropdown });
    }

    updateProfileLinks(link) {
        const { value } = event.target as HTMLInputElement;
        const [profile, updateProfile] = this.context;
        profile.links[link] = value;
        updateProfile({links:profile.links});
    }
    render() {
        const { dropdown, search, status, links } = this.state;
        const [profile, updateProfile] = this.context;

        return (
            <div id="sidepanel">
                <div id="profile" className={dropdown.links ? "expanded" : ""}>
                    <div className="wrap">

                        <div id="info" className={profile.isPro ? "pro" : ""}>
                            <img id="profile-img" src={profile.picture} className={profile.status}
                                onClick={() => this.toggleDropdown("status")}
                            />
                            <p>{profile.name}</p>
                            <i className="fa fa-chevron-down expand-button" aria-hidden="true"
                                onClick={() => this.toggleDropdown("links")} />
                        </div>

                        <div id="status-options" className={dropdown.status ? "active" : ""}
                            onMouseLeave={() => this.toggleDropdown("status", false)}
                        >
                            <ul>
                                {
                                    status.map((state, i) =>
                                        <li
                                            key={i}
                                            className={state == profile.status ? "active" : ""}
                                            id={'status-' + state}
                                            onClick={() => updateProfile({status: state as UserStatus})}
                                        >
                                            <p>{state}</p>
                                            <span className="status-circle"></span>
                                        </li>
                                    )
                                }
                            </ul>
                        </div>

                        {profile.links &&
                            <div id="expanded" >
                                {
                                    links.map((link, i) => (
                                        // style won't works here because input should be outside lable
                                        <label htmlFor="link">

                                            <i className={['fa', 'fa-' + link, 'fa-fw'].join(",")} aria-hidden="true" />
                                            <input name="link" type="text" value={profile.links[link]} onChange={() => this.updateProfileLinks(link)} />
                                        </label>
                                    ))
                                }
                            </div>
                        }
                    </div>
                </div >
                <div id="search">
                    <label ><i className="fa fa-search" aria-hidden="true"></i></label>
                    <input type="text"
                        value={search}
                        onChange={e => this.setState({ search: e.target.value })}
                        placeholder="Search contacts..."
                    />
                </div>

                <Contact
                    search={search}
                    dropdown={dropdown.links}
                    selectFriend={this.props.selectFriend}
                    friendSelected={this.props.friendSelected}
                />

                <div id="bottom-bar">
                    <Link to="/profile/friends" id="addcontact">
                        <i className="fa fa-user-plus fa-fw" aria-hidden="true"></i> <span>friends</span>
                    </Link>
                    <Link to="/profile/setting" id="settings">
                        <i className="fa fa-cog fa-fw" aria-hidden="true"></i> <span>Settings</span>
                    </Link>
                </div>
            </div >
        )
    }
}

export default Sidepanel;