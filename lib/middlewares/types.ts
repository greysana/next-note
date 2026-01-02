import { NextRequest, NextResponse } from "next/server";
import { ZodType } from "zod";
export type RouteContext = {
  params: Promise<Record<string, string>>;
};

export type RouteHandler<T = unknown> = (
  request: NextRequest,
  context: RouteContext
) => Promise<NextResponse<T>>;

export type Middleware = (
  handler: RouteHandler
) => (request: NextRequest, context: RouteContext) => Promise<NextResponse>;

export type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export interface RequestLogger {
  info(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  debug(message: string, meta?: Record<string, unknown>): void;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public errors?: unknown
  ) {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = "Too many requests") {
    super(message, 429, "RATE_LIMIT_EXCEEDED");
    this.name = "RateLimitError";
  }
}
