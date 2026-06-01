import { GraphQLClient } from "graphql-request";

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

  return process.env.NEXT_PUBLIC_BASE_URL_API_DEV;
};

const baseUrl = buildBaseUrl();
const graphQlBaseUrl = baseUrl?.replace(/\/api\/?$/, "");
const GRAPHQL_ENDPOINT = `${graphQlBaseUrl}/graphql`;

function getGraphQLClient(): GraphQLClient {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return new GraphQLClient(GRAPHQL_ENDPOINT, {
    headers,
    credentials: "include",
  });
}

/**
 * Execute a GraphQL request with automatic token-refresh retry.
 *
 * If the first request fails with a 401-like error, we attempt to
 * refresh the access token (same flow as the Axios interceptor) and
 * retry once. If the refresh also fails, the user is redirected to login.
 */
export async function graphqlRequest<T>(
  document: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  try {
    const client = getGraphQLClient();
    return await client.request<T>(document, variables);
  } catch (error: unknown) {
    // Check if this is an authentication error
    const isAuthError =
      error instanceof Error &&
      (error.message.includes("Authentication required") ||
        (error as { response?: { status?: number } }).response?.status === 401);

    if (!isAuthError) {
      throw error;
    }

    // Attempt token refresh
    try {
      const apiBaseUrl = baseUrl;
      const res = await fetch(`${apiBaseUrl}/users/refresh`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Refresh failed");

      const data = await res.json();
      localStorage.setItem("accessToken", data.data.accessToken);

      // Retry with the new token
      const retryClient = getGraphQLClient();
      return await retryClient.request<T>(document, variables);
    } catch {
      // Refresh failed — logout
      localStorage.removeItem("accessToken");

      try {
        await fetch(`${apiBaseUrl}/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch {
        // Ignore logout API failure
      }

      window.location.href = "/auth/login";
      throw error;
    }
  }
}

export default getGraphQLClient;
