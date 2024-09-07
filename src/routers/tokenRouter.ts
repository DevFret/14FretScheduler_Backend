import { Router, Request, Response } from "express";
import { verifyAccessToken, verifyRefreshToken } from "../utils/verifyToken";
import { decode } from "jsonwebtoken";
import { generateAccessToken } from "../utils/handleLogin";

const router = Router();

// ok가 false인 경우, message가 "Access token expired"인 경우에만
// refresh token을 사용해 access token을 다시 획득하는 것을 시도하고
// 나머지 경우 로그아웃시킨 뒤 로그인 창으로 네비게이팅 해줘야 한다.
// 이를 위해 token 검증을 수행하는 엔드포인트다.
router.get("/validate", (req: Request, res: Response) => {
  if (!req.headers.authorization) {
    console.log(
      "GET /token/validate 400: authorization 헤더에 jwt가 담겨있지 않습니다"
    );
    res.status(400).json({
      ok: false,
      message: "authorization 헤더에 jwt가 담겨있지 않습니다",
    });
    return;
  }
  const accessToken = req.headers.authorization.split(" ")[1];
  if (verifyAccessToken(accessToken)) {
    console.log("GET /token/validate 200: accessToken이 만료되지 않았습니다");
    res.status(200).json({
      ok: true,
      message: "accessToken이 만료되지 않았습니다",
    });
    return;
  } else {
    console.log("GET /token/validate 401: accessToken이 만료되었습니다");
    res.status(401).json({
      ok: false,
      message: "accessToken이 만료되었습니다",
    });
    return;
  }
});

router.get("/refresh", async (req: Request, res: Response) => {
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
        console.log("GET /token/refresh 200: 새 accessToken을 발급했습니다");
        res.status(200).json({
          accessToken: newAccessToken,
        });
      } else {
        // 둘 다 만료된 경우
        // FE쪽 로그아웃 시켜야 함
        console.log(
          "GET /token/refresh 401: accessToken, refreshToken 모두 만료되었습니다"
        );
        res.status(401).json({
          ok: false,
          message: "Both tokens expired",
        });
      }
    } else {
      // accessToken을 디코딩 한 결과가 비어있는 경우
      console.log("GET /token/refresh 400: accessToken에 문제가 있습니다");
      res.status(400).json({
        ok: false,
        message: "No Authorized",
      });
    }
  } else {
    // refreshToken과 accessToken 모두 존재하지 않는 경우
    console.log(
      "GET /token/refresh 400: accessToken과 refreshToken이 요청 headers에 존재하지 않습니다"
    );
    res.status(400).json({
      ok: false,
      message: "Access token and refresh token not found",
    });
  }
});

export const tokenRouter = router;
