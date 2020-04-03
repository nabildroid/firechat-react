import * as React from "react";
import { db, FieldValue } from "../../main";
import { FriendsContext, ProfileContext, UserContext } from "../../contexts";
import { Request, FriendsContextType, ProfileContextType } from "../../types";
import { QuerySnapshot } from "@firebase/firestore-types";
import { Link } from "react-router-dom";

import Coupon from "../../components/coupon";

import "../../style/friends.css";

type Props = {
    requests: [
        Request[],
        (requests: Request[]) => void
    ]
}

type User = {
    uid: string;
    name: string;
    bio: string;
    picture: string;
}

const usersRef = db.collection("users");
const conversationRef = db.collection("conversation");


function Friends({ requests }: Props) {
    const [Requests, setRequests] = requests;
    const [search, setSearch] = React.useState<string>("");
    const [users, setUsers] = React.useState<User[]>([]);
    const [loading, setLoading] = React.useState<boolean>(false);
    const [friends, setFriends] = React.useContext<FriendsContextType>(FriendsContext);
    const [profile] = React.useContext<ProfileContextType>(ProfileContext);
    const authUser = React.useContext(UserContext);

    // coupon page
    const [showCoupon,setShowCoupon] = React.useState<boolean>(false);
    const [isProNow,setIsProNow] = React.useState<()=>void>(null);
    const [couponInfo,setCouponInfo] = React.useState<string>("");

    React.useEffect(searchForUser, [search]);

    function searchForUser() {
        if (search.length > 2 && !loading) {
            setLoading(true);
            const query = usersRef.where("name", ">=", search.toLowerCase()).
                where("name", "<=", search.toLowerCase() + '\uf8ff')
            query.get().then((snapshot: QuerySnapshot<User>) => {
                console.log(snapshot.size + " of users Found");
                const foundUsers: User[] = [];
                snapshot.docs.forEach(doc => {
                    const user = doc.data();
                    user.uid = doc.id;
                    if (user.uid != authUser.uid && !friends.find(({ uid }) => uid == user.uid))
                        foundUsers.push(user);
                })
                setUsers(foundUsers)
            }).finally(() => setLoading(false));
        }
    }

    function conversationDoc(friendUid: string) {
        const docName = authUser.uid > friendUid ? friendUid + authUser.uid : authUser.uid + friendUid;

        return conversationRef.doc(docName);
    }

    /**
     * send friend request
     * @param uid user id of the receiver
     */
    function add(uid) {
        if (friends.length < (profile.isPro ? 20 : 6)) {
            const { name, picture } = users.find(u => u.uid == uid);

            conversationDoc(uid).set({
                parts: [authUser.uid, uid],
                partsnapshot: {
                    0: {
                        name: profile.name,
                        picture: profile.picture,
                        status: profile.status
                    },
                    1: { name, picture }
                }
            }).catch(() => { setUsers(users); error("Request didn't sent") }); // show error

            setUsers(users.filter(u => u.uid != uid))
        }else if(!profile.isPro){
            prepareCoupon(
                `you have ${friends.length} friend, please be pro to add more friends`,
                ()=>add(uid)
            )
        }
    }

    function accept(uid) {
        if (friends.length < (profile.isPro ? 20 : 6)) {
            conversationDoc(uid)
                .update({ snippet: "" })
                .catch(() => {
                    setRequests(Requests);
                    error("friend request did't accepted")
                })

            setRequests(Requests.filter(r => r.uid != uid))
        }else if(!profile.isPro){
            prepareCoupon(
                `you have ${friends.length} friend, please be pro to accept more friend requests`,
                ()=>accept(uid)
            )
        }
    }


    function remove(uid) {
        const isFriend = friends.some(f => f.uid == uid)

        conversationDoc(uid)
            .delete()
            .catch(() => {
                if (isFriend) setFriends(friends);
                else setRequests(Requests)
                error("friend didn't removed")
            })

        if (isFriend) setFriends(friends.filter(r => r.uid != uid))
        else setRequests(Requests.filter(r => r.uid != uid))

    }

    function blockFriend(uid) {
        if(profile.isPro) {
            conversationDoc(uid).update({
                partsnapshot: FieldValue.delete(),
                snippet: FieldValue.delete()

            }).catch(() =>{
                error("friend didn't blocked");
                // we didn't use closure to set back the prev friends state because in 'profile' component there is an open listener to handle any new friend, and firebase after recognizing that an error occurred during removed things it automatically triggers added event in any relevant open listener
            })

            setFriends(friends.filter(r => r.uid != uid))
        }else{
            const {name} = friends.find(f=>f.uid == uid);
            prepareCoupon(
                `you have to be pro in order to block ${name} but you can remove him`,
                ()=>blockFriend(uid)
            )
        }
    }

    function blockUser(uid) {
        if (profile.isPro){
            conversationDoc(uid).set({
                parts: [authUser.uid, uid]
            }).catch(() => {
                // set back the old users that contain what been blocked `closure`
                setUsers(users);
                error("user didn't blocked")
            })
            setUsers(users.filter(u => u.uid != uid));
        }else{
            const {name} = users.find(f=>f.uid == uid);
            prepareCoupon(
                `you have to be pro in order to block ${name}`,
                ()=>blockUser(uid)
            )
        }
    }

    function prepareCoupon(msg:string,next?:()=>void){
        setCouponInfo(msg);
         if(next)
            setIsProNow(()=>next);
        setShowCoupon(true)
    }

    function error(msg: string = "error") {
        alert(msg + ", please try again");
    }
    console.log(friends)
    return (
        <div id="friends">
            <header>
                <img src={profile.picture} />
                <b>{profile.name}</b>
            </header>
            <div id="addfriend">
                <div id="add">
                    <span>add friend</span>
                    <input type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="enter friend name"
                    />
                    <span onClick={() => setSearch("")}>X</span>
                </div>
                <div id="list">
                    {!search &&
                        <ul>
                            {
                                Requests.map((request, i) =>
                                    <li key={i}>
                                        <a className="info">
                                            <img src={request.picture} />
                                            <b>{request.name}</b>
                                        </a>
                                        <div className="tool">
                                            <button className="add"
                                                onClick={() => accept(request.uid)}
                                            >accept</button>
                                            <button className="remove"
                                                onClick={() => remove(request.uid)}
                                            >remove</button>
                                        </div>
                                    </li>
                                )
                            }
                            {

                                friends.map((friend, i) =>
                                    <li key={i}>
                                        <a className="info">
                                            <img src={friend.picture} />
                                            <b>{friend.name}</b>
                                        </a>
                                        <div className="tool">
                                            <button className="remove"
                                                onClick={() => remove(friend.uid)}
                                            >remove</button>
                                            <button className="block"
                                                onClick={() => blockFriend(friend.uid)}
                                            >block</button>
                                        </div>
                                    </li >
                                )
                            }
                        </ul >
                    }
                    {
                        search &&
                        <ul>
                            {loading && <span>loading</span>}
                            {
                                users.length &&
                                users.map((user, i) =>
                                    <li key={i} className={user.bio ? "withBio" : ""}>
                                        <a className="info">
                                            <img src={user.picture} />
                                            <b>{user.name}</b>
                                            {
                                                user.bio &&
                                                <p>{user.bio}</p>
                                            }

                                        </a>
                                        <div className="tool">
                                            <button className="add"
                                                onClick={() => add(user.uid)}
                                            >add</button>
                                            <button className="block"
                                                onClick={() => blockUser(user.uid)}
                                            >block</button>
                                        </div >
                                    </li >
                                )
                            }
                        </ul >
                    }
                    <div id="remain">
                        {

                            Array(profile.isPro ? 20 : 6).fill(null).map((_, i) =>
                                <span key={i} className={i + 1 <= friends.length ? "full" : ""}></span>
                            )
                        }
                    </div >
                </div >
            </div >
            <div id="bottom-bar">
                <Link to="profile" id="addcontact">
                    <i className="fa fa-user-plus fa-fw" aria-hidden="true"></i> <span>Messages</span>
                </Link>
                <Link to="/profile/setting" id="settings">
                    <i className="fa fa-cog fa-fw" aria-hidden="true"></i> <span>Settings</span>
                </Link>
            </div>
            {showCoupon &&
                <Coupon hide={() => setShowCoupon(false)} continue={isProNow}>
                    <p>{couponInfo}</p>
                </Coupon>
            }
        </div >
    )
}


export default Friends;