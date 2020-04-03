# ToDo

- [x] Login

  1. [x] enter
  2. [x] Create

- [x] profile

  1. [x] main
  2. [x] sidepanle
     1. [x] contact
  3. [X] messaging

- [X] friends

- [X] setting
  1. [X] info
  2. [X] password

## Remember

- [X] Add auto redirect to `Welcome` if a user is not login and same about login page when user is login

- [X] Redirect new users to setting page for quick changing their profile information [vue version](https://github.com/nabildroid/firechat/blob/1800eb43e2944e31667e9d15b0a314ec04aac8b3/src/components/login/createAccount.vue#L45-L49)

  `firebase.auth.UserMetadata`

- [ ] When user login, check if his status is `offline` then changing it to `online`

- [X] reflect any change in user document to all his conversation using **cloud functions** [vue version](https://github.com/nabildroid/firechat/blob/master/src/views/profile.vue#L137-L154)

- [ ] prevent a user from changing his information directly from conversation partsnapshot **security rules**

- [x] selected(string is UID of the friend) friend inside panel

- [ ] show social links of a friend in the head of conversation [vue version](https://github.com/nabildroid/firechat/blob/master/src/components/chat/messaging.vue#L75-L78)

- [X] cloud function for automatically pick the latest message and put it in conversation snippet

- [ ] prevent users from updating snippet directly **security rules**

- [ ] rename `coupon` component to be more meaning

- [ ] **lasy-loading** the `firebase/storage` in messaging,setting components

- [ ] the image in the message must contain only its full path in storage, not a downloaded URL [vue version](https://github.com/nabildroid/firechat/blob/master/src/components/chat/messaging.vue#L113-L117)

- [ ] friend number limitation applied when sending or receiving requests (security rules)

- [ ] security rule for preventing not pro users to upload images into messages object

- [ ] could function for automatically update user profile when a photo gets uploaded to his profile

- [X] bio is not updated when first entering coupon code
