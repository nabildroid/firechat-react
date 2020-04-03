import * as React from "react";

import { ProfileContext } from "../../contexts";
import { ProfileContextType } from "../../types";

import UploadImage from "../../utils/uploadImage";

import Coupon from "../coupon";

type State = {
    name: string,
    bio: string,
    facebook: string,
    twitter: string,
    instagram: string,
    fileSource: File,
    previewImage: string,
    uploadFlag: boolean,
    showCoupon: boolean,
    isProNow: () => void
}
class Info extends React.Component<any, State>{
    context: ProfileContextType;
    static contextType = ProfileContext;
    imagePreviewRef: React.RefObject<HTMLImageElement>

    state: State = {
        name: "",
        bio: "",
        facebook: "",
        twitter: "",
        instagram: "",
        fileSource: null,
        previewImage: "",
        uploadFlag: false,
        showCoupon: false,
        isProNow: null
    }

    constructor(props) {
        super(props);

        this.imagePreviewRef = React.createRef<HTMLImageElement>();
    }
    componentDidMount() {
        const [profile] = this.context;
        this.setState({
            name: profile.name,
            bio: profile.bio || "",
            facebook: profile.links ? profile.links.facebook : "",
            twitter: profile.links ? profile.links.twitter : "",
            instagram: profile.links ? profile.links.instagram : ""
        })
    }


    changeFile() {
        const files = (event.target as HTMLInputElement).files
        const [file] = files;
        this.setState({
            fileSource: file
        })

        if (FileReader) {
            const fr = new FileReader();
            fr.onload = () => this.setState({ previewImage: fr.result.toString() })
            fr.readAsDataURL(file);
        } else this.setState({ previewImage: " " });

    }

    changeValue(key: "name" | "bio" | "facebook" | "instagram" | "twitter") {
        const { value } = event.target as HTMLInputElement;
        const insert = {};
        insert[key] = value;

        this.setState(insert);
    }
    validation() {
        return this.state.name.trim().length > 0;
    }

    update() {
        const { name, bio, facebook, twitter, instagram, fileSource, previewImage } = this.state;
        const [profile, setProfile] = this.context;

        if (bio && !profile.isPro) {
            this.setState({
                showCoupon: true,
                isProNow: () => setTimeout(() => this.update(), 700)
            })
        } else {
            const change = {
                name,
                picture: previewImage || profile.picture,
                // links: {
                //     facebook,
                //     twitter,
                //     instagram
                // }
            }
            if (bio) change["bio"] = bio;
            setProfile(change);

            if (fileSource) {
                this.setState({ uploadFlag: true });
                UploadImage(fileSource, profile.uid, "profile")
                    .catch(() => alert("your image didn't uploaded please try again"))
                    .finally(() => {
                        this.setState({ uploadFlag: false })
                    })
            }
        }
    }


    render() {
        const { name, bio, facebook, instagram, twitter, uploadFlag, previewImage, isProNow, showCoupon } = this.state;
        const validation = this.validation();
        const [profile] = this.context;
        return (
            <div id="section">
                <div id="inputs">
                    <div id="picture">
                        <img src={previewImage || profile.picture} ref={this.imagePreviewRef} />
                        <input type="file" accept="image/x-png,image/bmp,image/jpeg"
                            onChange={this.changeFile.bind(this)}
                        />
                        <span>{uploadFlag ? 'Uploading' : 'change'}</span>
                    </div>
                    <div>
                        <h1>info</h1>
                        <div>
                            <label>name</label>
                            <input type="text"
                                value={name}
                                onChange={this.changeValue.bind(this, "name")}
                            />
                            <label>bio</label>
                            <input type="text"
                                value={bio}
                                onChange={this.changeValue.bind(this, "bio")}
                            />
                        </div>
                        <h1>social links</h1>
                        <div>
                            <label>facebook</label>
                            <input type="text" placeholder="your facebook link"
                                value={facebook}
                                onChange={this.changeValue.bind(this, "facebook")}
                            />
                            <label>twitter</label>
                            <input type="text" placeholder="your twitter link"
                                value={twitter}
                                onChange={this.changeValue.bind(this, "twitter")}
                            />
                            <label>instagram</label>
                            <input type="text" placeholder="your instagram link"
                                value={instagram}
                                onChange={this.changeValue.bind(this, "instagram")}
                            />
                        </div>
                    </div>
                </div>
                <div id="tool">
                    <button
                        disabled={!validation}
                        onClick={() => this.update()}
                    >update</button>
                </div>
                {
                    showCoupon &&
                    <Coupon continue={isProNow} hide={() => this.setState({ showCoupon: false })}>
                        <pre>{bio}</pre>, well done, please consider to be Pro in order to publish you bio
                    </Coupon>
                }
            </div>
        )
    }
}

export default Info;