import * as functions from "firebase-functions";

import * as admin from "firebase-admin";
import { basename } from "path";

admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  storageBucket: "studied-alloy-234218.appspot.com"
});
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// [END import]

// [USER DOCUMENT create after new account has been created]
exports.createUserDoc = functions.auth.user().onCreate(async user => {
  admin
    .firestore()
    .collection("users")
    .doc(user.uid)
    .set({
      name:
        "user" +
        Math.random()
          .toString()
          .slice(2, 4),
      picture: "http://eng.uokerbala.edu.iq/stdform/student.png",
      status: "online",
      friendsNumber: 6
    });
});

// [COUPON applay and check]
exports.applayCoupon = functions.https.onCall(async (req, context) => {
  const code = req.code;

  if (!context.auth || !context.auth.uid)
    return { status: "error", message: "require permission" };
  else if (context.auth.token.pro == true)
    return { status: "success", message: "already pro member" };
  else if (await checkCoupon(code)) {
    await admin.auth().setCustomUserClaims(context.auth.uid, { pro: true });
    await admin
      .firestore()
      .collection("users")
      .doc(context.auth.uid)
      .update({
        friendsNumber: admin.firestore.FieldValue.increment(14)
      });
    return { status: "success", message: "valid coupon code" };
  } else return { status: "error", message: "your code is invalid" };
});

async function checkCoupon(code: number) {
  if (typeof code == "number" && code >= 1000 && code <= 9999) {
    //check if there are any promo code in environment variables
    if (parseInt(process.env.promoCode as string) == code) return true;
    //else check the database
    const ref = admin
      .firestore()
      .collection("coupon")
      .where("code", "==", code)
      .limit(1);
    let coupon = await ref.get();
    if (coupon.size) {
      const [doc] = coupon.docs;
      await doc.ref.delete();
      return true;
    }
  }
  return false;
}

// [FRIENDSCOUNTER count userFriendNumber]
function addToFriendsNumber(userId: string, value: any) {
  if (value != 0) {
    if (typeof value == "number")
      value = admin.firestore.FieldValue.increment(value);

    return admin
      .firestore()
      .collection("users")
      .doc(userId)
      .update({
        friendsNumber: value
      });
  } else return Promise.resolve();
}

type Conversation = {
  snippet: string;
  parts: [string, string];
};

exports.friendsCounterOnUpdate = functions.firestore
  .document("conversation/{parts}")
  .onUpdate(async (snap, context) => {
    const data = snap.after.data() as Conversation;
    const previous = snap.before.data() as Conversation;

    let incrementValue = 0;
    if ("snippet" in previous && !("snippet" in data)) incrementValue++;
    else if ("snippet" in data && !("snippet" in previous)) incrementValue--;

    await addToFriendsNumber(data.parts[0], incrementValue);
    await addToFriendsNumber(data.parts[1], incrementValue);
  });

exports.friendsCounterOnDelete = functions.firestore
  .document("conversation/{parts}")
  .onDelete(async (snap, context) => {
    const previous = snap.data() as Conversation;

    let incrementValue = 0;
    if ("snippet" in previous) incrementValue++;

    await addToFriendsNumber(previous.parts[0], incrementValue);
    await addToFriendsNumber(previous.parts[1], incrementValue);
  });

exports.resetFriendsNumber = functions.https.onRequest((req, res) => {
  const value = req.body.value;
  const promises = req.body.users.map((user: string) => {
    return addToFriendsNumber(user, value);
  });
  Promise.all(promises)
    .then(() => {
      console.log(req.body.users);
      res.send("success");
    })
    .catch(err => res.send(err));
});

type UserInfo = {
  name?: string;
  status?: string;
  picture?: string;
  snipprt?: string;
};
export const reflectUserChangedToConversation = functions.firestore
  .document("users/{userID}")
  .onUpdate(async (change, context) => {
    const before = change.before.data() as UserInfo;
    const after = change.after.data() as UserInfo;

    const update: UserInfo = {};
    if (before.name != after.name) update.name = after.name;
    if (before.status != after.status) update.status = after.status;
    if (before.picture != after.picture) update.picture = after.picture;

    if (Object.values(update)) {
      const batch = admin.firestore().batch();
      const { userID } = context.params;
      const conversationRef = admin.firestore().collection("conversation");
      conversationRef
        .where("parts", "array-contains", userID)
        .select()
        .get()
        .then(({ docs }) => {
          docs.map(doc => {
            const i = doc.id.startsWith(userID) ? 0 : 1;

            const updateFields: { [key: string]: any } = {};
            Object.entries(update).map(
              ([k, v]) => (updateFields[`partsnapshot.${i}.${k}`] = v)
            );

            batch.update(doc.ref, updateFields);
          });

          batch.commit();
        });
    }
  });

type Message = {
  content: string;
  receiver?: string; // uid
  image?: string;
};

export const snippetFromMesseges = functions.firestore
  .document("conversation/{conversationID}/messages/{messegeID}")
  .onCreate((snapshot, context) => {
    const { conversationID } = context.params;
    const { content, image } = snapshot.data() as Message;
    let snippet = "";
    if (image !== undefined) snippet = "you received an image";
    else {
      const length = 40;
      console.log(content, content.length);
      const dots = content.length > length ? "..." : "";
      snippet = content.substr(0, length) + dots;
    }

    return admin
      .firestore()
      .collection("conversation")
      .doc(conversationID)
      .update({
        snippet
      });
  });

export const updateUserPictureFromStorage = functions.storage
  .object()
  .onFinalize(obj => {
    const { name } = obj;
    if (name?.startsWith("profile/")) {
      const uid = basename(name);
      return admin
        .storage()
        .bucket()
        .file(name)
        .getSignedUrl({
          action: "read",
          expires: Date.now() * 1000
        })
        .then((url: string) => {
          admin
            .firestore()
            .collection("users")
            .doc(uid)
            .update({
              picture: url
            });
        });
    } else return;
  });
