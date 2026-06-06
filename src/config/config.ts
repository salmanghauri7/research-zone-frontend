export const buildBaseUrl = (ws:boolean=false) => {
  if (process.env.NODE_ENV === "production") {
    return ws ? process.env.NEXT_PUBLIC_BASE_URL_API_PROD : "";
  }

  const envUrl = process.env.NEXT_PUBLIC_BASE_URL_API_DEV;
  return envUrl;
};
