import axios from "axios";
import {
  KakaoResult,
  KakaoTokenData,
  UserData,
} from "../types/kakao_login/kakaoLoginType";

require("dotenv").config();

/**
 * @description Kakao 로그인 관련 로직과 값이 모인 Class
 */
class Kakao {
  private key: string;
  private redirectUri: string;
  constructor() {
    if (!process.env.KAKAO_KEY) {
      throw new Error("KAKAO_KEY 환경 변수가 설정되지 않았습니다.");
    }
    this.key = process.env.KAKAO_KEY;
    this.redirectUri = "http://localhost:3000/callback/kakao";
  }

  /**
   * @description 카카오 인가코드를 받기 위해 사용되는 URL 반환,
   * KAKAO_KEY를 Front 단에서 보이지 않게 하기 위해 사용됨
   */
  getAuthCodeUrl() {
    return `https://kauth.kakao.com/oauth/authorize?client_id=${this.key}&redirect_uri=${this.redirectUri}&response_type=code`;
  }

  /**
   * @description 프론트에서 받은 인가 코드를 통해 kakaoToken을 받아오는 함수
   * @see https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-token
   */
  async getKakaoToken(code: string) {
    const params = {
      client_id: this.key,
      code: code,
      grant_type: "authorization_code",
      redirect_uri: this.redirectUri,
    };

    const data: KakaoResult = await axios
      .post("https://kauth.kakao.com/oauth/token", params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      })
      .then((data) => data.data)
      .catch((err) => console.error("getKakaoToken function Error: ", err));

    const tokenData: KakaoTokenData = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    };

    console.log("kakaoTokenData: ", tokenData);

    return tokenData;
  }

  /**
   * @description 받아온 kakaoToken의 access_token을 사용해 userData를 받아오는 함수
   */
  async getUserData(token: KakaoTokenData) {
    const data = await axios
      .get("https://kapi.kakao.com/v2/user/me", {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      })
      .then((data) => data.data)
      .catch((err) => console.error("getUserData function Error: ", err));

    console.log("raw user data: ", data);

    const userData: UserData = {
      id: data.id,
      nickname: data.kakao_account.profile.nickname,
    };

    return userData;
  }
}

export const KakaoClient = new Kakao();
