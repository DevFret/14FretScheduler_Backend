import { Router, Request, Response } from "express";
import { KakaoClient } from "./kakao";
import { KakaoTokenData, LoginBody } from "../types/kakao_login/kakaoLoginType";

const router = Router();

router.get("/url", (req: Request, res: Response) => {
  console.log("GET /kakao/url start");
  try {
    const url = KakaoClient.getAuthCodeUrl();
    res.status(200).json({
      url: url,
    });
    console.log("GET /kakao/url success");
  } catch (err) {
    console.error("GET /kakao/url Error: ", err);
    res.status(500).json({ error: "Failed to get Kakao URL" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  console.log("POST /kakao/login start");
  try {
    const body: LoginBody = req.body;
    console.log("body: ", body);
    const kakaoToken: KakaoTokenData = await KakaoClient.getKakaoToken(
      body.code
    );
  } catch (err) {
    console.error("POST /kakao/login Error: ", err);
    res.status(500).json({ error: `Failed to kakao login: ${err}` });
  }
});

export const kakaoRouter = router;
