import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale negotiation + prefixing, via the Next 16 `proxy` convention.
export default createMiddleware(routing);

export const config = {
  // Match all paths except Next internals, API routes, and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
