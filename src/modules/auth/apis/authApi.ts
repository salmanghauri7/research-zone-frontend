import api from "@/utils/http/axios";
import { SignupData, LoginData } from "@/modules/auth/types/auth";

class AuthApi {
  async signup(data: SignupData) {
    return api.post("/users/signup", data);
  }

  async verifyOtp(otp: string) {
    return api.post("/users/verifyOtp", { otp });
  }

  async login(data: LoginData) {
    return api.post("/users/login", data);
  }

  async googleLogin(code: string) {
    return api.post("/users/google-login", { code });
  }

  async resendOtp(token: string) {
    return api.get(`/users/resendOtp/${token}`);
  }
}

const authApi = new AuthApi();

export default authApi;
