export interface JoinUser {
  id: string;
  email: string;
  mbrNm: string;
  gender: string;
}

declare module "express-session" {
  export interface SessionData {
    [key: string]: any;
    user?: JoinUser;
  }
}
