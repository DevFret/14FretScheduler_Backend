export type KakaoResult = {
  access_token: string;
  token_type: "bearer";
  refresh_token: string;
  id_token?: string;
  expires_in: number;
  scope?: string;
  refresh_token_expires_in: number;
};

export type KakaoTokenData = {
  access_token: string;
  refresh_token: string;
};

export type UserData = {
  id: string;
  nickname: string;
  name?: string; // Todo: 현재는 카카오에게서 이름 받아올 권한이 X
  phoneNum?: string; // Todo: 현재는 카카오에게서 전화번호를 받아올 권한이 X
};
