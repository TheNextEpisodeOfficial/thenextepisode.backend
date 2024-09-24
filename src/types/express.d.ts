import * as express from "express";

declare global {
  namespace Express {
    interface User {
      id: string; // 여기에 추가 속성 정의
      // 다른 속성도 추가 가능
    }

    interface Request {
      user?: User; // user 속성 추가
    }
  }
}
