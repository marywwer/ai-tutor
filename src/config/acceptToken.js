import { setStatToken } from "../shared/api/stats";

export const acceptToken = (token) => {
  setStatToken(token);
};