import { createLimiter } from "./rate.limiter.js";

// General API limiter (increased to prevent blocking state fetching)
export const apiLimiter = createLimiter(1000, 1 * 60 * 1000);

// Login/Register limiter (strict)
export const authLimiter = createLimiter(10, 1 * 60 * 1000);

// Like button limiter
export const likeLimiter = createLimiter(20, 1 * 60 * 1000);