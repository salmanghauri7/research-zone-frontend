import { useUserStore } from "@/store/userStore";
import api from "../http/axios";

export async function logout() {
  try {
    localStorage.removeItem("accessToken");
    await api.post("/users/logout", {
      method: "POST",
      credentials: "include",
    });
    useUserStore.getState().clearUser();

    window.location.href = "/auth/login";
  } catch (error) {
    console.error("Error during logout:", error);
    // Clear user data even if the API call fails
    useUserStore.getState().clearUser();
    // Still redirect even if the API call fails
    window.location.href = "/auth/login";
  }
}
