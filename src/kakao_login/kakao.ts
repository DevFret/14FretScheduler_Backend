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
}

export const KakaoClient = new Kakao();
