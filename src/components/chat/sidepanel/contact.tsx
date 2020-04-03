import *  as React from "react";

import { FriendsContextType, UserStatus, Friend } from "../../../types";
import { FriendsContext } from "../../../contexts";


type Props = {
    dropdown: boolean;
    search: string;
    friendSelected: string;
    selectFriend: (uid: string) => void;
}
class Contact extends React.Component<Props, any>{
    context: FriendsContextType;
    static contextType = FriendsContext;

    sortFriends() {
        const [friends] = this.context;
        const { search, friendSelected } = this.props;
        const sortedFriends = friends.map(friend => {
            let sum = friendSelected == friend.uid ? 100 : 0;
            sum += friend.name.indexOf(search) != -1 ? 4 : 0;
            if (friend.snippet)
                sum += friend.snippet.indexOf(search) != -1 ? 2 : 0;
            sum += 4 - Object.values(UserStatus).indexOf(friend.status);
            sum += Math.floor((friend.rank || 0) / 100000000000);
            /**@todo this line below will change the origin state use Object.assign instead */
            friend.rank = sum;
            return friend;
        });
        return sortedFriends.sort((a, b) => -a.rank + b.rank);
    }

    render() {
        const { dropdown, selectFriend, friendSelected } = this.props;
        const sortedFriends = this.sortFriends();
        console.log("contact rendering", sortedFriends);
        return (
            <div id="contacts" className={dropdown ? "expanded" : ""}>
                <ul>
                    {
                        sortedFriends.map((friend) =>
                            <li onClick={() => selectFriend(friend.uid)}
                                className={'contact ' + (friend.uid == friendSelected ? "active" : "")}
                                key={friend.uid}
                            >
                                <div className="wrap">
                                    <span className={'contact-status ' + friend.status} />
                                    <img src={friend.picture} />
                                    <div className="meta">
                                        <p className="name">{friend.name}</p>
                                        <p className="preview" > {friend.snippet}</p>
                                    </div>
                                </div>
                            </li>
                        )
                    }
                </ul>
            </div >
        )
    }
}

export default Contact;