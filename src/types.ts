import { DocumentReference } from "@firebase/firestore-types";

/**@todo updateObject must preserve any readonly key */
export type updateObject<T> = { [key in keyof T]?: T[key] };

export type ProfileContextType = [
  UserProfile,
  (data: updateObject<UserProfile>) => void
];

export type FriendsContextType = [Friend[], (friends: Friend[]) => void];

export enum UserStatus {
  ACTIVE = "online",
  AWAY = "away",
  BUSY = "busy",
  OFFLINE = "offline"
}
export type UserLinks = {
  facebook?: string;
  twitter?: string;
  instagram?: string;
};
export type UserProfile = {
  readonly uid: string;
  name: string;
  picture: string;
  readonly friendsNumber: number;
  status: UserStatus;
  links?: UserLinks;
  bio?: string;
  isPro?: boolean;
};

export type Friend = {
  ref: DocumentReference;
  readonly uid: string;
  readonly name: string;
  readonly picture: string;
  readonly status: UserStatus;
  snippet?: string;
  rank?: number;
};

export type Request = {
  readonly ref: DocumentReference;
  readonly uid: string;
  readonly name: string;
  readonly picture: string;
};
export type ConversationParts = [string, string]; // uid

export type ConversationPartsnapshot = {
  name: string;
  picture: string;
  status: UserStatus;
};

export type ConversationType = {
  parts: ConversationParts;
  partsnapshot: [ConversationPartsnapshot, ConversationPartsnapshot];
  snippet?: string;
};
