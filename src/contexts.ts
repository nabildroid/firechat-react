import { createContext } from "react";
import { User } from "@firebase/auth-types";
import {
  FriendsContextType,
  ProfileContextType
} from "./types";

export const UserContext = createContext<User>(undefined);

export const ProfileContext = createContext<ProfileContextType>([undefined, undefined]);

export const FriendsContext = createContext<FriendsContextType>([undefined, undefined]);
