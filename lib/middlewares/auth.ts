import { Middleware, UnauthorizedError } from "./types";

type AuthConfig = {
  verifyToken: (token: string) => Promise<unknown>;
  message?: string;
};

/**
 * Authentication middleware
 * Verifies bearer token from Authorization header
 */
export function withAuth(config: AuthConfig): Middleware {
  return (handler) => async (request, context) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError(
        config.message || "Missing or invalid authorization header"
      );
    }

    const token = authHeader.slice(7);

    try {
      await config.verifyToken(token);
      return handler(request, context);
    } catch {
      throw new UnauthorizedError(config.message || "Invalid or expired token");
    }
  };
}
