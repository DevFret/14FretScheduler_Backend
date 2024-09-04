import dotenv from "dotenv";
import { verify } from "jsonwebtoken";
import RefreshToken from "../models/refreshTokenSchema";

dotenv.config();

/**
 * @description 로그인에 사용되는 access token의 유효성을 검증하는 함수
 */
export const verifyAccessToken = (accessToken: string) => {
  try {
    verify(accessToken, process.env.JWT_SECRET || "");
    return true;
  } catch (err) {
    return false;
  }
};

/**
 * @description access token 연장에 사용되는 refresh token의 유효성을 검증하는 함수
 */
export const verifyRefreshToken = async (refreshToken: string, id: string) => {
  try {
    const data = await RefreshToken.findOne({ id: id }).exec();
    const dbRefreshToken = data?.refreshToken;
    if (dbRefreshToken === refreshToken) {
      try {
        verify(refreshToken, process.env.JWT_SECRET || "");
        return true; // refreshToken이 검증 완료된 case
      } catch (err) {
        return false; // refreshToken이 만료된 case
      }
    } else {
      return false; // refreshToken이 위조된 case
    }
  } catch (err) {
    return false; // User db에 해당 id가 없는 case
  }
};
