import { MbrEntity } from "../entities/mbr.entity";

declare module "express-session" {
  export interface SessionData {
    [key: string]: any;
    user?: MbrEntity;
  }
}
