import { NextRequest } from "next/server";
import { Middleware, ValidationSchemas } from "./types";

/**
 * Zod schema validation middleware
 * Validates request body, params, and query parameters
 */
export function withValidation(schemas: ValidationSchemas): Middleware {
  return (handler) => async (request, context) => {
    try {
      // Validate body
      if (schemas.body && ["POST", "PUT", "PATCH"].includes(request.method)) {
        const body = await request.json();
        schemas.body.parse(body);

        // Recreate request with validated body
        const newRequest = new NextRequest(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(body),
        });

        request = newRequest;
      }

      // Validate params
      if (schemas.params) {
        const params = await context.params;
        schemas.params.parse(params);
      }

      // Validate query
      if (schemas.query) {
        const query = Object.fromEntries(request.nextUrl.searchParams);
        schemas.query.parse(query);
      }

      return handler(request, context);
    } catch (error) {
      throw error; // Let error handler middleware handle it
    }
  };
}
