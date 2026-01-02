import { NextRequest } from "next/server";
import { Middleware } from "./types";

/**
 * Input sanitization middleware
 * Sanitizes request body to prevent XSS and other injection attacks
 */
export function withSanitization(): Middleware {
  return (handler) => async (request, context) => {
    // Only sanitize for methods with body
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      try {
        const contentType = request.headers.get("content-type");

        if (contentType?.includes("application/json")) {
          const body = await request.json();
          const sanitized = sanitizeObject(body);

          // Create new request with sanitized body
          const newRequest = new NextRequest(request.url, {
            method: request.method,
            headers: request.headers,
            body: JSON.stringify(sanitized),
          });

          return handler(newRequest, context);
        }
      } catch {
        // If parsing fails, continue with original request

        return handler(request, context);
      }
    }

    return handler(request, context);
  };
}

/**
 * Recursively sanitize an object
 */
function sanitizeObject(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    return sanitizeString(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }

  if (typeof obj === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[sanitizeString(key)] = sanitizeObject(value);
    }
    return sanitized;
  }

  return obj;
}

/**
 * Sanitize a string to prevent XSS
 */
function sanitizeString(str: string): string {
  return str
    .replace(/[<>]/g, "") // Remove < and >
    .replace(/javascript:/gi, "") // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, "") // Remove event handlers like onclick=
    .trim();
}
