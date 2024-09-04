import { Router, Request, Response } from "express";
import { KakaoClient } from "./kakao";

const router = Router();

router.get("/url", (req: Request, res: Response) => {
  console.log("GET /kakao/url start");
  try {
    const url = KakaoClient.getAuthCodeUrl();
    res.status(200).json({
      url: url,
    });
    console.log("GET /kakao/url success");
  } catch (e) {
    console.error("GET /kakao/url Error: ", e);
    res.status(500).json({ error: "Failed to get Kakao URL" });
  }
});

export const kakaoRouter = router;
