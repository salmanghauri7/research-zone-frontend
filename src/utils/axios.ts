import axios from "axios";

const baseUrl = "/api";
// const baseUrl = "http://localhost:5000";
if (!baseUrl) {
  throw new Error(
    "Environment variable BASE_URL_API_PROD is not set. Please define it to use the API client."
  );
}

const api = axios.create({
  baseURL: baseUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window != undefined) {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// ✅ Response interceptor
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Don't retry if this is already the refresh endpoint to prevent infinite loop
    const isRefreshEndpoint =
      originalRequest.url?.includes("/api/users/refresh");

    // Handle token refresh
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const res = await axios.get(`${baseUrl}/api/users/refresh`, {
          withCredentials: true,
        });
        localStorage.setItem("accessToken", res.data.data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed → logout and redirect to login
        localStorage.removeItem("accessToken");

        // Call logout API to clear cookies on backend
        try {
          await fetch("/api/logout", {
            method: "POST",
            credentials: "include",
          });
        } catch (logoutError) {
          console.error("Logout API failed:", logoutError);
        }

        window.location.href = "/auth/login";
        return Promise.reject(refreshError);
      }
    }

    // If refresh endpoint itself fails with 401, logout immediately
    if (error.response?.status === 401 && isRefreshEndpoint) {
      localStorage.removeItem("accessToken");
      window.location.href = "/auth/login";
      return Promise.reject(error);
    }

    // Handle backend error messages
    let message = "Something went wrong.";
    if (Array.isArray(error.response?.data?.message)) {
      message = error.response.data.message[0]?.message || message;
    } else if (typeof error.response?.data?.message === "string") {
      message = error.response.data.message;
    }

    // ✅ Attach readable message so UI can use it
    error.customMessage = message;

    return Promise.reject(error);
  }
);

export default api;
