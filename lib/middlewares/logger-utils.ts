/* eslint-disable @typescript-eslint/no-explicit-any */
import { logger } from "./logger";

/**
 * Log database operations
 */
export const logDatabaseOperation = (
  operation: string,
  collection: string,
  details?: Record<string, any>
) => {
  logger.info(`Database operation: ${operation}`, {
    collection,
    ...details,
  });
};

/**
 * Log cache hits/misses
 */
export const logCacheOperation = (
  operation: "hit" | "miss" | "invalidate",
  key: string,
  details?: Record<string, any>
) => {
  logger.info(`Cache ${operation}`, {
    key,
    ...details,
  });
};

/**
 * Log authentication events
 */
export const logAuthEvent = (
  event: "login" | "logout" | "register" | "failed_login",
  userId?: string,
  details?: Record<string, any>
) => {
  const logLevel = event === "failed_login" ? "warn" : "info";
  logger[logLevel](`Auth event: ${event}`, {
    userId,
    ...details,
  });
};

/**
 * Log validation errors
 */
export const logValidationError = (
  path: string,
  errors: any,
  details?: Record<string, any>
) => {
  logger.warn("Validation error", {
    path,
    errors,
    ...details,
  });
};

/**
 * Log rate limit events
 */
export const logRateLimit = (
  identifier: string,
  action: string,
  details?: Record<string, any>
) => {
  logger.warn("Rate limit exceeded", {
    identifier,
    action,
    ...details,
  });
};

/**
 * Log security events
 */
export const logSecurityEvent = (
  event: string,
  severity: "low" | "medium" | "high" | "critical",
  details?: Record<string, any>
) => {
  const logLevel =
    severity === "critical" || severity === "high" ? "error" : "warn";
  logger[logLevel](`Security event: ${event}`, {
    severity,
    ...details,
  });
};

/**
 * Create a structured error log
 */
export const logError = (
  error: Error,
  context?: string,
  details?: Record<string, any>
) => {
  logger.error(context || "Error occurred", {
    error: error.message,
    stack: error.stack,
    name: error.name,
    ...details,
  });
};
