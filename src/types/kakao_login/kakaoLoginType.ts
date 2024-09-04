export type LoginBody = {
  code: string;
};

export type KakaoResult = {
  access_token: string;
  token_type: "bearer";
  refresh_token: string;
  id_token: string;
  expires_in: number;
  scope: string; // 'profile_nickname'과 같이 추후 필요한 애들만 모아서 타입 고정시키자
  refresh_token_expires_in: number;
};

export type KakaoTokenData = {
  access_token: string;
  refresh_token: string;
};
