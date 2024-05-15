import { MbrEntity } from "../entities/mbr.entity";

declare module "express-session" {
  export interface SessionData {
    joinUser?: MbrEntity;
    loginUser?: MbrEntity;
  }
}
