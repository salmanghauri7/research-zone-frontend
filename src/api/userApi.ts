import api from "@/utils/http/axios";

/**
 * User API Module
 * Non-authentication user-related API calls
 * Note: Auth methods (signup, login, verify otp, etc.) are now in @/modules/auth/apis/authApi
 */
class UserApi {
  /**
   * Refresh access token
   */
  async refresh() {
    return api.get("/users/refresh");
  }

  /**
   * Check if username is available
   */
  async checkUsernameAvailability(username: string) {
    return api.post("/users/checkUsernameAvailability", { username });
  }

  /**
   * Add username to user profile
   */
  async addUsername(username: string) {
    return api.post("/users/addUsername", { username });
  }
}

// Export singleton instance
const userApi = new UserApi();
export default userApi;
