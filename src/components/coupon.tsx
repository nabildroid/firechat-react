import * as React from "react";
import { createPortal } from "react-dom";

import { Functions } from "../main";
import { UserContext, ProfileContext } from "../contexts";
import "../style/coupon.css";

type Props = {
    hide: () => void,
    continue?: () => void,
    children?: React.ReactNode
}

function Coupon(props: Props) {

    const authUser = React.useContext(UserContext)
    const [profile, setProfile] = React.useContext(ProfileContext)
    const [code, setCode] = React.useState<number>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
    //handle code input focus
    const input = React.useRef<HTMLInputElement>(null);

    const applyCoupon = Functions.httpsCallable("applayCoupon");
    const wrapper = React.useRef(null);

    if (wrapper.current == null) {
        const currentWrapper = document.createElement("div");
        currentWrapper.id = "coupon";
        wrapper.current = currentWrapper;
    }

    React.useEffect(() => {
        const parent = document.getElementById("app");
        parent.appendChild(wrapper.current);

        input.current.focus();

        return () => parent.removeChild(wrapper.current);
    }, [])

    function check() {
        setLoading(true)
        applyCoupon({ code }).then((res) => {
            console.log("cloud checked");
            if (res.data.status == "success") {
                authUser.getIdToken(true);
                setProfile({ isPro: true });
                if (props.continue)
                    props.continue();
                setTimeout(() => props.hide(), 100);
            } else {
                alert(res.data.message);
                setCode(0);
                input.current.focus();
            }

        }).finally(() => setLoading(false))
    }

    return createPortal((
        <div id="content">
            <span onClick={props.hide}>X</span>
            <h2>become a <b>Pro</b> member</h2>
            {props.children}
            <div id="inputs">
                <input type="number"
                    placeholder="please enter your code"
                    onChange={e => setCode(+e.target.value)}
                    value={code || ""}
                    ref={input}
                />
                <button
                    disabled={!code || code < 1000 || code > 9999 || loading}
                    onClick={check}
                >
                    {!loading ? "check" : "loading"}
                </button>
            </div>
            <sub>for <b>free membership</b> use <pre>2000</pre> promo code</sub>
        </div>
    ), wrapper.current)
}

export default Coupon;