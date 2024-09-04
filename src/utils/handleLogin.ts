import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import Users from "../models/userSchema";
import RefreshToken from "../models/refreshTokenSchema";
import { UserData } from "../types/kakao_login/kakaoLoginType";

dotenv.config();

/**
 * @description 존재하는 유저면 토큰 발급하고 로그인, 존재하지 않는 유저면 DB에 추가하고 토큰 발급해서 로그인 시키는 비동기 함수
 */
const handleLogin = async (userData: UserData) => {
  const isUserExists = await checkUserExistsById(userData.id);

  if (isUserExists) {
    const accessToken = generateAccessToken(userData.id);
    const refreshToken = generateRefreshToken();

    // 새로 생성한 refresh token을 DB에 업데이트
    await RefreshToken.updateOne(
      { id: userData.id },
      { $set: { refreshToken: refreshToken } }
    );

    return {
      message: "Success login",
      nickname: userData.nickname,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  } else {
    const newUser = new Users({ id: userData.id, nickname: userData.nickname });
    await newUser.save(); // DB에 새 유저 정보 저장
    const accessToken = generateAccessToken(userData.id);
    const refreshToken = generateRefreshToken();

    const newRefreshToken = new RefreshToken({
      id: userData.id,
      refreshToken: refreshToken,
    });

    // DB에 새 refresh token 저장
    await newRefreshToken.save();

    return {
      message: "Success signup & login",
      nickname: userData.nickname,
      accessToken: accessToken,
      refreshToken: refreshToken,
    };
  }
};

/**
 * @description 사용자 id로 유효기간이 1시간인 access token 생성
 */
export const generateAccessToken = (id: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
  }

  const token = jwt.sign({ id }, process.env.JWT_SECRET, {
    // accessToken - refreshToken 테스트를 원활하게 하기 위해 1m로 설정, 추후 12h로
    expiresIn: "1m",
  });

  return token;
};

/**
 * @description 유효기간이 1주일인 refresh token 생성
 */
const generateRefreshToken = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
  }

  const token = jwt.sign({}, process.env.JWT_SECRET, {
    // accessToken - refreshToken 테스트를 원활하게 하기 위해 2m로 설정, 추후 168h로
    expiresIn: "2m",
  });

  return token;
};

/**
 * @description DB에 사용자의 id와 매칭되는 값이 있는지 없는지를 반환
 */
const checkUserExistsById = async (id: string) => {
  const user = await Users.findOne({ id: id }).exec();
  return user !== null;
};

export default handleLogin;
