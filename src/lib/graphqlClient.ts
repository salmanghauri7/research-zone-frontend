import { buildBaseUrl } from "@/config/config";
import { GraphQLClient } from "graphql-request";

const baseUrl = buildBaseUrl(true);

const GRAPHQL_ENDPOINT = `${baseUrl}/graphql`;

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

export async function graphqlRequest<T>(
  document: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const apiBaseUrl = baseUrl;
  try {
    const client = getGraphQLClient();
    return await client.request<T>(document, variables);
  } catch (error: unknown) {
    const isAuthError =
      error instanceof Error &&
      (error.message.includes("Authentication required") ||
        (error as { response?: { status?: number } }).response?.status === 401);

    if (!isAuthError) {
      throw error;
    }

    // Attempt token refresh
    try {
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
