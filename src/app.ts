import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import { kakaoRouter } from "./kakao_login/kakaoRouter";

require("dotenv").config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다.");
}

// express
const app: Application = express();

// 카카오 로그인 관련 로직이 모여있는 라우터를 app에 연결
app.use("/kakao", kakaoRouter);
const port: number = 3001;

// mongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB 연결 성공..."))
  .catch((err) => console.error(err));

// hello world
app.get("/", (req: Request, res: Response) => {
  res.send("<h1>Hello world</h1>");
});

app.listen(port, () => {
  console.log(`Express가 ${port}번 포트에서 실행 중...`);
});
