import api from "@/utils/axios";

// Types for API requests and responses
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

export interface UsernameData {
    username: string;
}

/**
 * User API Module
 * Centralized API calls for all user-related endpoints
 */
class UserApi {
    /**
     * User signup
     */
    async signup(data: SignupData) {
        return api.post("/api/users/signup", data);
    }

    /**
     * Verify OTP after signup
     */
    async verifyOtp(otp: string) {
        return api.post("/api/users/verifyOtp", { otp });
    }

    /**
     * User login with email and password
     */
    async login(data: LoginData) {
        return api.post("/api/users/login", data);
    }

    /**
     * Google OAuth login
     */
    async googleLogin(code: string) {
        return api.post("/api/users/google-login", { code });
    }

    /**
     * Resend OTP to user
     */
    async resendOtp(token: string) {
        return api.get(`api/users/resendOtp/${token}`);
    }

    /**
     * Refresh access token
     */
    async refresh() {
        return api.get("/api/users/refresh");
    }

    /**
     * Check if username is available
     */
    async checkUsernameAvailability(username: string) {
        return api.post("/api/users/checkUsernameAvailability", { username });
    }

    /**
     * Add username to user profile
     */
    async addUsername(username: string) {
        return api.post("/api/users/addUsername", { username });
    }
}

// Export singleton instance
const userApi = new UserApi();
export default userApi;
