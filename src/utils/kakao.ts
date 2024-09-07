import axios, { isAxiosError } from "axios";
import dotenv from "dotenv";
import {
  KakaoResult,
  KakaoTokenData,
  KakaoUserData,
} from "../types/kakao_login/kakaoLoginType";

dotenv.config();

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

    try {
      const data = await axios.post<KakaoResult>(
        "https://kauth.kakao.com/oauth/token",
        params,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      if (data.data) {
        const tokenData: KakaoTokenData = {
          access_token: data.data.access_token,
          refresh_token: data.data.refresh_token,
        };
        return tokenData;
      }
    } catch (err) {
      if (isAxiosError(err)) {
        console.error(
          `getKakaoToken func Error: ${err.status}, ${err.response?.data}`
        );
      }
    }
  }

  /**
   * @description 받아온 kakaoToken의 access_token을 사용해 userData를 받아오는 함수
   */
  async getUserData(token: KakaoTokenData) {
    try {
      const response = await axios.get<KakaoUserData>(
        "https://kapi.kakao.com/v2/user/me",
        {
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        }
      );
      const userData = {
        id: response.data.id,
        nickname: response.data.kakao_account.profile.nickname,
      };
      return userData;
    } catch (err) {
      if (isAxiosError(err)) {
        console.error(
          `getUserData function Error: ${err.status}, ${err.response?.data} `
        );
      }
    }
  }
}

export const KakaoClient = new Kakao();
