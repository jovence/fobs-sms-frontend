import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale negotiation + prefixing. (Next 16 still supports `middleware`; the
// `proxy` convention is the future replacement — tracked for a later migration.)
export default createMiddleware(routing);

export const config = {
  // Match all paths except Next internals, API routes, and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
