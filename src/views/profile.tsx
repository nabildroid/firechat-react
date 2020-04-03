import * as React from "react";;
import { Redirect, RouteComponentProps } from "react-router-dom"
import { DocumentReference, DocumentChangeType } from "@firebase/firestore-types";
import { User } from "@firebase/auth-types";
import { ConversationType, Friend, Request, UserProfile, ProfileContextType, FriendsContextType, updateObject, UserStatus } from "../types";
import { UserContext, ProfileContext, FriendsContext } from "../contexts"
import { db, Auth } from "../main";

import Chat from "./profile/chat";
import Friends from "./profile/friends";
import Setting from "./profile/setting";



type RouteParams = { page: "friends" | "setting" | undefined }


type State = {
    userRef: DocumentReference;
    profile: UserProfile;
    requests: Request[]; // friend requests
    friends: Friend[];
}

type Props = RouteComponentProps<RouteParams>;

class Profile extends React.Component<Props, State>{

    stopFirendsListener: () => void;
    context: User;
    static contextType = UserContext;
    constructor(props) {
        super(props);

    }
    state: State = {
        userRef: null,
        profile: null,
        requests: [], // friend requests
        friends: []
    }
    async initialize() {

        const userRef = await db.collection("users").doc(this.context.uid);
        this.setState({ userRef });

        const idTokenResult = await this.context.getIdTokenResult();
        const claims = idTokenResult.claims;

        console.log("initializing profile");
        // this part is callback because user document will be created by cloud function 
        const fetshUserDoc = userRef.onSnapshot(snapshot => {
            if (snapshot.exists) {
                fetshUserDoc(); //stop listener to user doc when ever it got created

                const data = snapshot.data() as UserProfile;

                this.setState({
                    profile: {
                        uid: this.context.uid,
                        ...data,
                        isPro: !!claims.pro
                    }
                }, () => {
                    const { profile } = this.state;
                    if (profile.status == "offline") {
                        /**@todo update user status to be online*/
                    }
                });

                this.initializeFriends();
            }

        });
    }

    async initializeFriends() {
        console.log("fetching Friends...");

        // each convrsation document represent one friendshep between this.context and other user
        const conversationRef = db.collection("conversation");

        const friendsRef = conversationRef.where("parts", "array-contains", this.context.uid)
            .where("partsnapshot.0.name", ">=", "");

        this.stopFirendsListener = await friendsRef.onSnapshot(snapshot => {
            console.log(snapshot.size);
            let { friends, requests } = this.state;

            snapshot.docChanges().forEach(change => {
                console.log(change);

                const data = change.doc.data() as ConversationType;
                const whichPart = data.parts.indexOf(this.context.uid) as 0 | 1;
                const friendSnapshot = data.partsnapshot[(whichPart + 1) % 2];

                const friend: Friend = {
                    ref: change.doc.ref,
                    uid: data.parts[(whichPart + 1) % 2],
                    ...friendSnapshot
                }

                // request 
                if (data.snippet === undefined && whichPart == 1)
                    this.handleRequestQuerySnapshot(friend, change.type)
                // friend
                if (data.snippet !== undefined)
                    this.handleFriendQuerySnapshot(friend, change.type)

            });
        });
    }

    handleRequestQuerySnapshot(friend: Friend, change: DocumentChangeType) {
        let { requests } = this.state;
        if (change == "added") {
            requests.push(friend);
        } else if (change == "removed") {
            requests = requests.filter(({ uid }) => uid != friend.uid);
        }
        // request couldn't be modified because the only case when request got modified is when user block the sender then, the document will no longer fetched by the query because will not has `partsnapshot.0.name` field then in this case this change is a remove action in this query

        this.setState({ requests });
    }

    handleFriendQuerySnapshot(friend: Friend, change: DocumentChangeType) {
        console.log("handleFriendQuerySnapshot", friend, change)
        let { friends } = this.state;
        if (change == "added") {
            //add some payload to sort friend based on last message
            friend.rank = new Date().getTime();
            friend.rank *= friend.snippet ? 2 : 1;

            friends.push(friend);
        }
        else if (change == "modified") {
            const i = friends.findIndex(f => f.uid == friend.uid);
            if (i !== -1) friends[i] = friend;
            else return this.handleFriendQuerySnapshot(friend, "added");
        }
        else {
            friends = friends.filter(({ uid }) => uid != friend.uid);
        }

        this.setState({ friends });
    }

    updateOnlineProfile(data: updateObject<UserProfile>) {
        delete data.isPro;
        delete data.picture;
        if (data) {
            // update user document
            const { userRef } = this.state;
            userRef.update(data).then(() => {
                if (data.status == UserStatus.OFFLINE)
                    this.signOut()
            })
            // reflect changes to all user conversations using cloud function
        }
    }

    ProfileProvider(): ProfileContextType {
        const { profile } = this.state;
        return [
            profile,
            (data) =>
                this.setState(({ profile }) => ({
                    profile: {
                        ...profile,
                        ...data
                    }
                }), () => this.updateOnlineProfile(data))
        ]
    }

    FriendsProvider(): FriendsContextType {
        const { friends } = this.state;
        return [
            friends,
            (friends: Friend[]) =>
                this.setState({ friends })
        ]
    }

    updateRequests(requests: Request[]) {
        this.setState({ requests })
    }
    signOut() {
        Auth.signOut();
    }
    componentWillMount() {
        this.initialize().then(() => {
            console.log("profile initialized");
        })
    }
    componentWillUnmount() {
        this.stopFirendsListener();
    }

    render() {
        const { params } = this.props.match;
        const { requests, profile } = this.state;

        let section = <Redirect to="/profile" />
        if (params.page == "friends")
            section = <Friends requests={[requests, this.updateRequests.bind(this)]} />
        else if (params.page == "setting")
            section = <Setting />
        else if (!params.page)
            section = <Chat />

        return (
            profile &&
            <ProfileContext.Provider value={this.ProfileProvider()}>
                <FriendsContext.Provider value={this.FriendsProvider()}>
                    {section}
                </FriendsContext.Provider>
            </ProfileContext.Provider>
        )
    }

}

export default Profile;