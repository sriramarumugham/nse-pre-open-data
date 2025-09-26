export class RateLimiter implements DurableObject {
  private requests: number[] = [];
  private readonly WINDOW_MS = 60000; // 1 minute window
  private readonly MAX_REQUESTS = 30; // 30 requests per minute

  async fetch(request: Request): Promise<Response> {
    const now = Date.now();

    // Clean up old requests outside the window
    this.requests = this.requests.filter(timestamp =>
      now - timestamp < this.WINDOW_MS
    );

    // Check if limit exceeded
    if (this.requests.length >= this.MAX_REQUESTS) {
      return new Response(JSON.stringify({ allowed: false }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Add current request
    this.requests.push(now);

    return new Response(JSON.stringify({ allowed: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
}