import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { kakaoRouter } from "./routers/kakaoRouter";
import { tokenRouter } from "./routers/tokenRouter";

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다.");
}

// express
const app: Application = express();

// body를 json으로 파싱하는 미들웨어 추가
app.use(express.json());

// 로그인, 인증 관련 로직이 모여있는 라우터를 app에 연결
app.use("/kakao", kakaoRouter); // kakao 인가코드 받기 - 토큰 받기 관련 라우터
app.use("/token", tokenRouter); // access token과 refresh token을 사용해 로그인 상태를 확인하는 라우터

const port: number = 3001;

// mongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB 연결 성공..."))
  .catch((err) => console.error(err));

app.listen(port, () => {
  console.log(`Express가 ${port}번 포트에서 실행 중...`);
});
