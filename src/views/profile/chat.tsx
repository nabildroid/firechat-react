import * as React from "react";;


import Sidepanel from "../../components/chat/sidepanel";
import Messaging from "../../components/chat/messaging";

import { FriendsContext } from "../../contexts";
import { FriendsContextType } from "../../types";
type State = {
    friendSelected: string; // friend UID
}
class Chat extends React.Component<any, State>{
    context: FriendsContextType;
    static contextType = FriendsContext;

    state: State = {
        friendSelected: null
    }
    selectFriend(uid: string) {
        this.setState({
            friendSelected: uid
        })
    };

    render() {
        const { friendSelected } = this.state;
        const [friends] = this.context;
        const friend = friends.find(({ uid }) => uid == friendSelected);

        return (
            <div id="template">
                <Sidepanel friendSelected={friendSelected} selectFriend={this.selectFriend.bind(this)} />
                {
                    friendSelected &&
                    <Messaging
                        friend={friend}
                        key={friendSelected}
                    />
                }

            </div>
        )
    }
}

export default Chat;