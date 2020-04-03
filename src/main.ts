import { createElement } from "react";
import { render } from "react-dom";

import * as firebase from "firebase/app";

import "firebase/firestore";
import "firebase/auth";
import "firebase/storage";
import "firebase/functions";
import firebaseConfig from "./firebase.config";

firebase.initializeApp(firebaseConfig);

export const db = firebase.firestore();
export const Auth = firebase.auth();
export const storage = firebase.storage().ref();
export const Timestamp = firebase.firestore.Timestamp;
export const FieldValue = firebase.firestore.FieldValue;
export const Functions = firebase.functions();
import App from "./app";
import "./style/main.css";

const root = document.createElement("div");
root.id = "root";

render(createElement(App), root);

document.body.prepend(root);
