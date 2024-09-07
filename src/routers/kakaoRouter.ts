import { Router, Request, Response } from "express";
import { KakaoClient } from "../utils/kakao";
import handleLogin from "../utils/handleLogin";

const router = Router();

router.get("/url", (req: Request, res: Response) => {
  try {
    const url = KakaoClient.getAuthCodeUrl();
    res.status(200).json({
      message: "Success",
      url: url,
    });
    console.log("GET /kakao/url success");
  } catch (err) {
    console.error("GET /kakao/url Error: ", err);
    res.status(500).json({ message: "Failed to get Kakao URL" });
  }
});

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { code }: { code: string } = req.body;
    const kakaoToken = await KakaoClient.getKakaoToken(code);
    if (kakaoToken) {
      const userData = await KakaoClient.getUserData(kakaoToken);
      if (userData) {
        console.log("POST /kakao/login success");
        const dataWithJWT = await handleLogin(userData);
        res.status(200).json(dataWithJWT);
      }
    }
  } catch (err) {
    console.error("POST /kakao/login Error: ", err);
  }
});

export const kakaoRouter = router;
