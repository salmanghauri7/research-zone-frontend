export const config = {
  LOCAL_SERVER_URL: "http://localhost:5000",
  SERVER_URL:
    process.env.NODE_ENV === "production"
      ? process.env.NEXT_PUBLIC_BASE_URL_API_PROD ||
        "https://13.205.7.218.sslip.io"
      : process.env.NEXT_PUBLIC_BASE_URL_API_DEV || "http://localhost:4000",
};
