import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ApiError, ValidationError, Middleware } from "./types";
import { logger } from "./logger";

/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */
export function withErrorHandling(): Middleware {
  return (handler) => async (request, context) => {
    try {
      return await handler(request, context);
    } catch (error) {
      // Log error
      logger.error("API Error:", {
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
        path: request.nextUrl.pathname,
        method: request.method,
      });

      // Handle Zod validation errors
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Validation failed",
            code: "VALIDATION_ERROR",
            details: error.issues.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          },
          { status: 400 }
        );
      }

      // Handle custom API errors
      if (error instanceof ApiError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            ...(error instanceof ValidationError && { details: error.errors }),
          },
          { status: error.statusCode }
        );
      }

      // Handle unknown errors
      return NextResponse.json(
        {
          error:
            process.env.NODE_ENV === "production"
              ? "Internal server error"
              : error instanceof Error
                ? error.message
                : "Unknown error",
          code: "INTERNAL_ERROR",
        },
        { status: 500 }
      );
    }
  };
}
