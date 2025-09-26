/// <reference types="@cloudflare/workers-types" />

import { OpenAPIHono, createRoute, z } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";

interface Env {
  R2_BUCKET: R2Bucket;
  RATE_LIMITER: DurableObjectNamespace;
}

const app = new OpenAPIHono<{ Bindings: Env }>();

// CORS middleware
app.use("/*", cors());

// Rate limiting middleware using Durable Objects
app.use("/api/*", async (c, next) => {
  const ip = c.req.header("CF-Connecting-IP") || "unknown";
  const id = c.env.RATE_LIMITER.idFromName(ip);
  const limiter = c.env.RATE_LIMITER.get(id);

  const response = await limiter.fetch(
    new Request("http://internal/check", {
      method: "POST",
    })
  );

  const { allowed } = (await response.json()) as { allowed: boolean };

  if (!allowed) {
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  return next();
});

// Schemas
const ListDatesQuerySchema = z.object({
  page: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional(),
});

const ListDatesResponseSchema = z.object({
  dates: z.array(z.string()),
  totalCount: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

const DownloadFileParamsSchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .openapi({
      example: "2024-09-24",
      description: "Date in YYYY-MM-DD format",
    }),
});

const ErrorResponseSchema = z.object({
  error: z.string(),
});

// List available dates route
const listDatesRoute = createRoute({
  method: "get",
  path: "/api/dates",
  tags: ["Data Access"],
  summary: "List available dates with pre-open market data",
  description:
    "Get a paginated list of all available dates for NSE pre-open market data",
  request: {
    query: ListDatesQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": {
          schema: ListDatesResponseSchema,
        },
      },
      description: "Successfully retrieved list of available dates",
    },
    429: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Rate limit exceeded - too many requests",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

app.openapi(listDatesRoute, async (c) => {
  const query = c.req.valid("query");
  const page = query.page || 1;
  const limit = query.limit || 10;

  try {
    const objects = await c.env.R2_BUCKET.list({
      prefix: "pre-open-market/",
    });

    // Extract unique dates from file names
    const dateSet = new Set<string>();
    objects.objects.forEach((obj: R2Object) => {
      const match = obj.key.match(/(\d{4}-\d{2}-\d{2})\.csv$/);
      if (match) {
        dateSet.add(match[1]);
      }
    });

    const dates = Array.from(dateSet).sort().reverse();
    const totalCount = dates.length;
    const totalPages = Math.ceil(totalCount / limit);

    // Pagination
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedDates = dates.slice(start, end);

    return c.json(
      {
        dates: paginatedDates,
        totalCount,
        page,
        limit,
        totalPages,
      },
      200
    );
  } catch (error) {
    console.error("Error listing dates:", error);
    return c.json({ error: "Failed to list dates" }, 500);
  }
});

// Download file route
const downloadFileRoute = createRoute({
  method: "get",
  path: "/api/download/{date}",
  tags: ["Data Access"],
  summary: "Download pre-open market data for a specific date",
  description:
    "Download the complete NSE pre-open market data for a specific date in CSV format",
  request: {
    params: DownloadFileParamsSchema,
  },
  responses: {
    200: {
      content: {
        "text/csv": {
          schema: z
            .string()
            .openapi({ description: "NSE pre-open market data in CSV format" }),
        },
      },
      description: "Successfully retrieved CSV data for the specified date",
    },
    400: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Invalid date format - must be YYYY-MM-DD",
    },
    404: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "No data found for the specified date",
    },
    429: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Rate limit exceeded - too many requests",
    },
    500: {
      content: {
        "application/json": {
          schema: ErrorResponseSchema,
        },
      },
      description: "Internal server error",
    },
  },
});

app.openapi(downloadFileRoute, async (c) => {
  const { date } = c.req.valid("param");

  try {
    const key = `pre-open-market/${date}.csv`;
    const object = await c.env.R2_BUCKET.get(key);

    if (!object) {
      return c.json({ error: "File not found for the specified date" }, 404);
    }

    const csvData = await object.text();

    // Return CSV data as text with proper content-type
    return new Response(csvData, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${date}.csv"`,
      },
    });
  } catch (error: any) {
    console.error("Error downloading file:", error);
    return c.json({ error: "Failed to download file" }, 500);
  }
});

// Swagger UI
app.get("/", swaggerUI({ url: "/doc" }));

// OpenAPI documentation
app.doc("/doc", {
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "NSE Pre-Open Market Data API",
    description: `


This API provides access to NSE (National Stock Exchange) pre-open market data stored in Cloudflare R2.

## 🚀 Features
- **Public Access**: No authentication required
- **Rate Limited**: 30 requests per minute per IP using Durable Objects
- **Paginated Results**: Efficient data retrieval with pagination
- **CSV Format**: Downloads original CSV files from NSE
- **CORS Enabled**: Works with web applications
- **Real-time Data**: Data scraped daily from NSE official website



## 🔒 Rate Limiting
- **Limit**: 30 requests per minute per IP address
- **Implementation**: Cloudflare Durable Objects for distributed rate limiting
- **Response**: Returns 429 status when limit exceeded

## 📝 Example Usage

### List all available dates (paginated)
\`\`\`bash
curl "https://nse-pre-open-api.sreeram-amg.workers.dev/api/dates?page=1&limit=10"
\`\`\`

### Download CSV data for specific date
\`\`\`bash
curl -O "https://nse-pre-open-api.sreeram-amg.workers.dev/api/download/2024-09-24"
\`\`\`

## 📅 Data Availability
Data is available from the date the scraper started running. New data is added daily after market pre-open session.
    `,
  },
  servers: [
    {
      url: "https://nse-pre-open-api.sreeram-amg.workers.dev",
      description: "Production API Server",
    },
  ],
});

export default app;
