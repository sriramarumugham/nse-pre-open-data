import app from './index';

// Export the Durable Object class
export { RateLimiter } from './rate-limiter';

// Export the Hono app as the default handler
export default {
  fetch: app.fetch,
};