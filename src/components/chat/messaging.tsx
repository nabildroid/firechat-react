import * as React from "react";

import { ProfileContext } from "../../contexts";
import { Timestamp as TimestampType, CollectionReference, QuerySnapshot } from "@firebase/firestore-types";
import { Friend, ProfileContextType } from "../../types";
import { Timestamp } from "../../main";

import UploadImage from "../../utils/uploadImage";
import Coupon from "../coupon";
import "../../style/messaging.css";

type Props = {
    friend: Friend;
};

type State = {
    ref: CollectionReference,
    messages: Message[],
    currentMessage: string,
    showCoupon: boolean,
    isProNow: () => void
}

type Message = {
    content: string;
    receiver: string; // uid
    image?: string;
    time: TimestampType;
}
class Messaging extends React.Component<Props, State>{
    context: ProfileContextType;
    static contextType = ProfileContext;
    stopMessagesListener: () => void;
    fileInput: React.RefObject<HTMLInputElement>

    state: State = {
        ref: null,
        messages: [],
        currentMessage: "",
        showCoupon: false,
        isProNow: this.sendImage.bind(this)
    }

    constructor(props) {
        super(props);
        this.fileInput = React.createRef<HTMLInputElement>()
    }

    componentWillMount() {
        const { friend } = this.props;
        const ref = friend.ref.collection("messages");

        this.setState({ ref }, () => this.init());
    }

    componentDidMount() {
        this.listen();
    }

    init() {
        // get the previous 10 messages
        const { ref, messages } = this.state;
        const query = ref.where("time", "<", Timestamp.now())
            .orderBy("time", "desc").limit(10);

        query.get().then((snapshot: QuerySnapshot<Message>) => {
            snapshot.docs.reverse().forEach(doc => {
                const data = doc.data();
                messages.push(data);
            });
            this.setState({ messages })
        })
    }

    listen() {
        // listen to upcoming messages
        const { ref, messages } = this.state;
        const query = ref.where("time", ">=", Timestamp.now());

        this.stopMessagesListener = query.onSnapshot(
            (snapshot: QuerySnapshot<Message>) => {
                console.log("observed" + new Date().getTime());

                snapshot.docChanges().forEach(change => {
                    if (change.type == "added") {
                        const data = change.doc.data();
                        messages.push(data);
                    }
                });
                this.setState({ messages })
            },
            error => {
                alert("you not longer have permission to contact such user");
            }
        );
    }

    componentWillUnmount() {
        this.stopMessagesListener();
    }

    msgs() {
        const { messages } = this.state
        const { friend } = this.props;
        const [profile] = this.context;

        return messages.map(({ content, receiver, image }) => ({
            content,
            image,
            sender: receiver != friend.uid ? "sent" : "replies",
            picture: receiver != friend.uid ? friend.picture : profile.picture
        }));
    }

    // getSocialLink() { }

    send() {
        const { currentMessage, ref } = this.state;
        const { friend } = this.props;
        if ((event.type == "click" || event.type == "keyup" && (event as KeyboardEvent).ctrlKey)
            && currentMessage.replace("\n", "").trim()) {
            ref.add({
                receiver: friend.uid,
                content: currentMessage,
                time: Timestamp.now()
            });
            this.setState({ currentMessage: "" })
        } else if ((event as KeyboardEvent).keyCode == 13) {
            this.setState({ currentMessage: currentMessage + "\n" })
        }
    }

    sendImage() {
        const [profile] = this.context;
        const { friend } = this.props;

        const { ref } = this.state;

        if (!profile.isPro) return this.setState({ showCoupon: true })

        const [file] = this.fileInput.current.files;
        UploadImage(file, profile.uid, "messages", true).then(uploadTaskSnapshot => {
            uploadTaskSnapshot.ref.getDownloadURL().then(url => {
                /**@todo cloud function that will automatically send a message contain the image when ever user upload it*/
                ref.add({
                    receiver: friend.uid,
                    image: url,
                    time: Timestamp.now()
                })
            })
        })
    }


    // scrollDown() { }

    render() {
        const { currentMessage, isProNow, showCoupon } = this.state;
        const { friend } = this.props;
        const msgs = this.msgs();
        return (
            <div className="content">
                <div className="contact-profile">
                    <img src={friend.picture} />
                    <p> {friend.name} </p>

                    <div className="social-media">
                        <a v-if="getSocialLink('facebook')" href="'//facebook.com/'+getSocialLink('facebook')">
                            <i className="fa fa-facebook" aria-hidden="true"></i>
                        </a>
                        <a v-if="getSocialLink('twitter')" href="'//twitter.com/'+getSocialLink('twitter')">
                            <i className="fa fa-twitter" aria-hidden="true"></i>
                        </a>
                        <a v-if="getSocialLink('instagram')" href="'//instagram.com/'+getSocialLink('instagram')">
                            <i className="fa fa-instagram" aria-hidden="true"></i>
                        </a>
                    </div >

                </div >
                <div className="messages" ref="wall">
                    <ul>
                        {
                            msgs.map((msg, i) =>
                                <li key={i} className={msg.sender}>
                                    <img src={msg.picture} />
                                    <p>{msg.content}</p>
                                    <img v-if={msg.image} src={msg.image} />
                                </li>
                            )
                        }
                    </ul>
                </div >
                < div className="message-input" >
                    <div className="wrap">
                        <textarea placeholder="Write your message..."
                            value={currentMessage}
                            onChange={e => this.setState({ currentMessage: e.target.value })}
                            onKeyUp={this.send.bind(this)}
                        />

                        <i className="fa fa-paperclip attachment" aria-hidden="true"
                            onClick={() => this.fileInput.current.click()}
                        ></i>

                        <input type="file" accept="image/x-png,image/bmp,image/jpeg" hidden
                            onChange={this.sendImage.bind(this)}
                            ref={this.fileInput}
                        />

                        <button className="submit"
                            onClick={this.send.bind(this)}
                            disabled={!currentMessage.length}
                        >
                            <i className="fa fa-paper-plane" aria-hidden="true"></i>
                        </button >
                    </div >
                </div >
                {showCoupon &&
                    <Coupon hide={() => this.setState({ showCoupon: false })} continue={isProNow}>
                        <p>
                            sending images requires a Pro membership
                    </p>
                    </Coupon>
                }
            </div >
        )
    }
}

export default Messaging;