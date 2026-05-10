export type GoogleAuthCodeResponse = {
  code?: string;
};

export interface SignupData {
  firstName: string;
  lastName?: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  email?: string;
  username?: string;
  password: string;
}
