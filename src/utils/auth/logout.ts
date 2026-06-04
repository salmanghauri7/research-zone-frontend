import { useUserStore } from "@/store/userStore";

const buildApiBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    return "";
  }

  const envUrl = process.env.NEXT_PUBLIC_BASE_URL_API_DEV;
  return envUrl;
};

const apiBaseUrl = buildApiBaseUrl();

export async function logout() {
  try {
    localStorage.removeItem("accessToken");
    const response = await fetch(`${apiBaseUrl}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Logout failed");
    }

    // Clear user data from store
    useUserStore.getState().clearUser();

    // Redirect to login page
    window.location.href = "/auth/login";
  } catch (error) {
    console.error("Error during logout:", error);
    // Clear user data even if the API call fails
    useUserStore.getState().clearUser();
    // Still redirect even if the API call fails
    window.location.href = "/auth/login";
  }
}
