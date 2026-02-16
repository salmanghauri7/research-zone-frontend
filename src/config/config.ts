// Determine the backend server URL based on environment
const getServerUrl = () => {
  // In production (Vercel deployment)
  if (process.env.NODE_ENV === "production") {
    const prodUrl = process.env.NEXT_PUBLIC_BASE_URL_API_PROD;
    if (!prodUrl) {
      console.warn("⚠️ NEXT_PUBLIC_BASE_URL_API_PROD is not set! Using fallback.");
    }
    return prodUrl || "https://13.205.7.218.sslip.io";
  }
  
  // In development (local)
  return process.env.NEXT_PUBLIC_BASE_URL_API_DEV || "http://localhost:5000";
};

export const config = {
  LOCAL_SERVER_URL: "http://localhost:5000",
  SERVER_URL: getServerUrl(),
};
