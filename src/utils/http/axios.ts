import axios from "axios";

const buildBaseUrl = () => {
  if (process.env.NODE_ENV === "production") {
    const prodUrl = process.env.NEXT_PUBLIC_BASE_URL_API_PROD;
    if (!prodUrl) {
      throw new Error(
        "Environment variable NEXT_PUBLIC_BASE_URL_API_PROD is not set. Please define it to use the API client.",
      );
    }
    return prodUrl;
  }

  const envUrl = process.env.NEXT_PUBLIC_BASE_URL_API_DEV;
  return envUrl;
};

const baseUrl = buildBaseUrl();

const api = axios.create({
  baseURL: baseUrl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
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
    if (!originalRequest) {
      return Promise.reject(error);
    }

    const isRefreshEndpoint = originalRequest.url?.includes("/users/refresh");

    const isAuthEndpoint =
      originalRequest.url?.includes("/users/login") ||
      originalRequest.url?.includes("/users/signup") ||
      originalRequest.url?.includes("/users/google-login") ||
      originalRequest.url?.includes("/users/verifyOtp");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshEndpoint &&
      !isAuthEndpoint
    ) {
      originalRequest._retry = true;
      try {
        const res = await api.get("/users/refresh", { withCredentials: true });
        localStorage.setItem("accessToken", res.data.data.accessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${res.data.data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token failed → logout and redirect to login
        localStorage.removeItem("accessToken");

        // Call logout API to clear cookies on backend
        try {
          await fetch(`${baseUrl}/logout`, {
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
  },
);

export default api;
