import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  "/", // Landing page
  "/sign-in(.*)", // Sign in pages
  "/sign-up(.*)", // Sign up pages
]);

// Define protected routes that require authentication
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/chat(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Optional: Additional protection for sensitive routes
  if (isProtectedRoute(req)) {
    const { userId } = await auth();
    if (!userId) {
      // This will redirect to sign-in
      await auth.protect();
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
