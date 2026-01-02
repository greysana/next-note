import { Middleware, RouteHandler } from "./types";
/**
 * Compose multiple middleware functions into a single handler
 * Middleware are executed from right to left (bottom to top in the array)
 */
export function compose(
  ...middlewares: Middleware[]
): (handler: RouteHandler) => RouteHandler {
  return (handler: RouteHandler) => {
    return middlewares.reduceRight(
      (next, middleware) => middleware(next),
      handler
    );
  };
}
