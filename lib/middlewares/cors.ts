import { NextResponse } from "next/server";
import { Middleware } from "./types";

type CorsConfig = {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
  exposedHeaders?: string[];
  credentials?: boolean;
  maxAge?: number;
};

/**
 * CORS middleware
 * Handles Cross-Origin Resource Sharing
 */
export function withCors(config: CorsConfig = {}): Middleware {
  const {
    origin = "*",
    methods = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders = ["Content-Type", "Authorization"],
    exposedHeaders = [],
    credentials = false,
    maxAge = 86400,
  } = config;

  return (handler) => async (request, context) => {
    // Handle preflight
    if (request.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": Array.isArray(origin)
            ? origin.join(", ")
            : origin,
          "Access-Control-Allow-Methods": methods.join(", "),
          "Access-Control-Allow-Headers": allowedHeaders.join(", "),
          "Access-Control-Max-Age": maxAge.toString(),
          ...(credentials && { "Access-Control-Allow-Credentials": "true" }),
        },
      });
    }

    const response = await handler(request, context);

    // Add CORS headers to response
    response.headers.set(
      "Access-Control-Allow-Origin",
      Array.isArray(origin) ? origin.join(", ") : origin
    );

    if (exposedHeaders.length > 0) {
      response.headers.set(
        "Access-Control-Expose-Headers",
        exposedHeaders.join(", ")
      );
    }

    if (credentials) {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return response;
  };
}
