import { Middleware } from "./types";
import { logger } from "./logger";

/**
 * Request/response logging middleware
 * Logs all incoming requests and outgoing responses with timing and status codes
 */
export function withLogging(): Middleware {
  return (handler) => async (request, context) => {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();

    // Log incoming request
    logger.info("Incoming request", {
      requestId,
      method: request.method,
      path: request.nextUrl.pathname,
      query: Object.fromEntries(request.nextUrl.searchParams),
      userAgent: request.headers.get("user-agent"),
      ip:
        request.headers.get("x-forwarded-for") ||
        request.headers.get("x-real-ip"),
    });

    try {
      const response = await handler(request, context);
      const duration = Date.now() - startTime;

      // Determine log level based on status code
      const status = response.status;
      let logLevel: "info" | "warn" | "error" = "info";

      if (status >= 500) {
        logLevel = "error";
      } else if (status >= 400) {
        logLevel = "warn";
      }

      // Parse response body for additional context (if JSON)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let responseData: any = null;
      try {
        const clonedResponse = response.clone();
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("application/json")) {
          responseData = await clonedResponse.json();
        }
      } catch {
        // Ignore parse errors
      }

      // Log completed request
      logger[logLevel]("Request completed", {
        requestId,
        method: request.method,
        path: request.nextUrl.pathname,
        status,
        statusText: getStatusText(status),
        duration: `${duration}ms`,
        ...(responseData?.error && { error: responseData.error }),
        ...(status >= 400 && responseData && { responseBody: responseData }),
      });

      // Add timing and request ID headers
      response.headers.set("X-Response-Time", `${duration}ms`);
      response.headers.set("X-Request-ID", requestId);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;

      // Log error with full details
      logger.error("Request failed with exception", {
        requestId,
        method: request.method,
        path: request.nextUrl.pathname,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw error;
    }
  };
}

/**
 * Helper function to get status text from status code
 */
function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
  };

  return statusTexts[status] || "Unknown";
}
