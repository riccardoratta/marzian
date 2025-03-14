import { Cookies } from "react-cookie";
import { DURATION_IN_DAYS } from "@/constants/cookies";

export const stdCookieStore: Cookies["set"] = (key, value, options) => {
  const now = new Date();
  const expires = new Date(now.getTime());
  expires.setUTCDate(now.getUTCDate() + DURATION_IN_DAYS);
  new Cookies().set(key, value, { path: "/", expires, ...options });
};
