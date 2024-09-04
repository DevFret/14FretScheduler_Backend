import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { kakaoRouter } from "./kakao_login/kakaoRouter";
import { verifyAccessToken, verifyRefreshToken } from "./utils/verifyToken";
import { decode } from "jsonwebtoken";
import { generateAccessToken } from "./utils/handleLogin";

dotenv.config();

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI 환경 변수가 설정되지 않았습니다.");
}

// express
const app: Application = express();

// body를 json으로 파싱하는 미들웨어 추가
app.use(express.json());

// 카카오 로그인 관련 로직이 모여있는 라우터를 app에 연결
app.use("/kakao", kakaoRouter);
const port: number = 3001;

// mongoDB 연결
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB 연결 성공..."))
  .catch((err) => console.error(err));

// ok가 false인 경우, message가 "Access token expired"인 경우에만
// refresh token을 사용해 access token을 다시 획득하는 것을 시도하고
// 나머지 경우 로그아웃시킨 뒤 로그인 창으로 네비게이팅 해줘야 한다.
// 이를 위해 token 검증을 수행하는 엔드포인트다.
app.get("/token/validate", (req: Request, res: Response) => {
  if (!req.headers.authorization) {
    res.status(400).json({
      ok: false,
      message: "authorization 헤더에 jwt가 담겨있지 않습니다",
    });
    return;
  }
  const accessToken = req.headers.authorization.split(" ")[1];
  if (verifyAccessToken(accessToken)) {
    res.status(200).json({
      ok: true,
      message: "accessToken이 만료되지 않았습니다",
    });
    return;
  } else {
    res.status(401).json({
      ok: false,
      message: "accessToken이 만료되었습니다",
    });
    return;
  }
});

app.get("/token/refresh", async (req: Request, res: Response) => {
  if (req.headers.authorization && req.headers.refreshtoken) {
    const accessToken = req.headers.authorization.split(" ")[1];
    const refreshToken = req.headers.refreshtoken as string;

    const decoded = decode(accessToken) as { id: string };
    if (decoded) {
      const isVerifyRefreshToken = await verifyRefreshToken(
        refreshToken,
        decoded.id
      );

      if (isVerifyRefreshToken) {
        // accessToken은 만료되었지만, refreshToken은 만료되지 않은 경우
        const newAccessToken = generateAccessToken(decoded.id);
        res.status(200).json({
          accessToken: newAccessToken,
        });
      } else {
        // 둘 다 만료된 경우
        // FE쪽 로그아웃 시켜야 함
        res.status(401).json({
          ok: false,
          message: "Both tokens expired",
        });
      }
    } else {
      // accessToken을 디코딩 한 결과가 비어있는 경우
      res.status(400).json({
        ok: false,
        message: "No Authorized",
      });
    }
  } else {
    // refreshToken과 accessToken 모두 존재하지 않는 경우
    res.status(400).json({
      ok: false,
      message: "Access token and refresh token not found",
    });
  }
});

app.listen(port, () => {
  console.log(`Express가 ${port}번 포트에서 실행 중...`);
});
