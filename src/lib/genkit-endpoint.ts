/**
 * Copyright 2025 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { createHash } from "crypto";
import { GenerateStreamResponse, z } from "genkit";
import { NextRequest, NextResponse } from "next/server";
import { GenerateRequestSchema } from "./schema";
import { toReadableStream } from "./utils";
import { adminAppCheck, adminAuth, adminRtdb } from "./firebase-admin";

if (process.env.NODE_ENV === "production") {
  import("@genkit-ai/firebase").then(({ enableFirebaseTelemetry }) => {
    enableFirebaseTelemetry();
  });
}

const ChatRequestSchema = GenerateRequestSchema.extend({
  context: z.record(z.unknown()).optional(),
});

export type ChatHandler<T = z.infer<typeof ChatRequestSchema>> = (
  data: T
) => GenerateStreamResponse<any> | Promise<GenerateStreamResponse<any>>;

export interface ChatEndpointOptions<T extends z.ZodTypeAny = z.ZodTypeAny> {
  schema?: T;
  maxBodyBytes?: number;
}

export interface SimpleEndpointOptions<T extends z.ZodTypeAny = z.ZodTypeAny> {
  schema?: T;
  maxBodyBytes?: number;
}

type Endpoint = (request: NextRequest) => Promise<NextResponse>;

const DEFAULT_MAX_BODY_BYTES = 48 * 1024; // 48 KB for text chat endpoints

const MAX_REQUESTS_HOURLY = parseInt(
  process.env.MAX_REQUESTS_HOURLY || "30",
  10
);
const MAX_IP_REQUESTS_HOURLY = parseInt(
  process.env.MAX_IP_REQUESTS_HOURLY || "60",
  10
);
const MAX_GLOBAL_REQUESTS_HOURLY = parseInt(
  process.env.MAX_GLOBAL_REQUESTS_HOURLY || "500",
  10
);
const ENFORCE_APP_CHECK = process.env.ENFORCE_APP_CHECK === "true";

const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS || process.env.SITE_ORIGIN || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
);

function errorResponse(error: { message: string; status: number }) {
  return new NextResponse(JSON.stringify(error), {
    status: error.status,
    headers: { "content-type": "application/json" },
  });
}

async function incrementCounter(path: string): Promise<number> {
  const { committed, snapshot } = await adminRtdb
    .ref(path)
    .transaction((count) => (count || 0) + 1);
  if (!committed) return Number.MAX_SAFE_INTEGER;
  return snapshot.val();
}

function getClientIp(request: NextRequest): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (!forwarded) return null;
  const parts = forwarded
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  // Behind a reverse proxy, use the penultimate hop when multiple entries exist.
  return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || null;
}

function hashKey(value: string): string {
  return createHash("sha256").update(value).digest("hex").slice(0, 32);
}

async function authorize(request: NextRequest): Promise<NextResponse | null> {
  if (process.env.NODE_ENV === "production" && ALLOWED_ORIGINS.size > 0) {
    const origin = request.headers.get("origin");
    if (!origin || !ALLOWED_ORIGINS.has(origin)) {
      return errorResponse({
        message: "Requests are only permitted from authorized origins.",
        status: 403,
      });
    }
  }

  if (ENFORCE_APP_CHECK) {
    const appCheckToken = request.headers.get("x-firebase-appcheck");
    if (!appCheckToken) {
      return errorResponse({
        message: "Missing App Check token.",
        status: 403,
      });
    }
    try {
      await adminAppCheck.verifyToken(appCheckToken);
    } catch {
      return errorResponse({
        message: "Invalid or expired App Check token.",
        status: 403,
      });
    }
  }

  const idToken = request.headers.get("authorization")?.split(" ")[1];
  if (!idToken) {
    return errorResponse({
      message: "You must be authenticated to make requests to demos.",
      status: 403,
    });
  }

  let uid: string;
  try {
    ({ uid } = await adminAuth.verifyIdToken(idToken));
  } catch {
    return errorResponse({
      message: "Invalid or expired authentication token.",
      status: 401,
    });
  }

  const hourBucket = new Date().toISOString().substring(0, 13);
  const clientIp = getClientIp(request);

  const [globalCount, uidCount, ipCount] = await Promise.all([
    incrementCounter(`limits/${hourBucket}/global`),
    incrementCounter(`limits/${hourBucket}/uid/${uid}`),
    clientIp
      ? incrementCounter(`limits/${hourBucket}/ip/${hashKey(clientIp)}`)
      : Promise.resolve(0),
  ]);

  if (globalCount > MAX_GLOBAL_REQUESTS_HOURLY) {
    return errorResponse({
      status: 429,
      message:
        "Demo capacity for this hour has been reached. Please try again later.",
    });
  }
  if (uidCount > MAX_REQUESTS_HOURLY || ipCount > MAX_IP_REQUESTS_HOURLY) {
    return errorResponse({
      status: 429,
      message:
        "You have reached your demo request limit for the hour. Come back later.",
    });
  }
  return null;
}

async function readJsonBody(
  request: NextRequest,
  maxBytes: number
): Promise<{ data?: unknown; error?: NextResponse }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return {
      error: errorResponse({
        status: 413,
        message: "Request payload exceeds maximum allowed size.",
      }),
    };
  }

  const raw = await request.text();
  if (Buffer.byteLength(raw, "utf8") > maxBytes) {
    return {
      error: errorResponse({
        status: 413,
        message: "Request payload exceeds maximum allowed size.",
      }),
    };
  }

  try {
    return { data: JSON.parse(raw) };
  } catch {
    return {
      error: errorResponse({
        status: 400,
        message: "Invalid JSON request body.",
      }),
    };
  }
}

function formatValidationError(err: z.ZodError): string {
  const first = err.issues[0];
  return first ? `Invalid request: ${first.message}` : "Invalid request payload.";
}

export function simpleEndpoint<Input = unknown, Output = unknown>(
  handler: (input: Input) => Promise<Output>
): Endpoint;
export function simpleEndpoint<T extends z.ZodTypeAny, Output = unknown>(
  options: SimpleEndpointOptions<T>,
  handler: (input: z.infer<T>) => Promise<Output>
): Endpoint;
export function simpleEndpoint<Input = unknown, Output = unknown>(
  optionsOrHandler:
    | SimpleEndpointOptions
    | ((input: Input) => Promise<Output>),
  handler?: (input: Input) => Promise<Output>
): Endpoint {
  const options =
    typeof optionsOrHandler === "function" ? {} : optionsOrHandler;
  const resolvedHandler =
    typeof optionsOrHandler === "function" ? optionsOrHandler : handler!;
  const maxBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;

  return async function (request: NextRequest): Promise<NextResponse> {
    const authError = await authorize(request);
    if (authError) return authError;

    const { data, error } = await readJsonBody(request, maxBytes);
    if (error) return error;

    let input: Input;
    if (options.schema) {
      const parsed = options.schema.safeParse(data);
      if (!parsed.success) {
        return errorResponse({
          status: 400,
          message: formatValidationError(parsed.error),
        });
      }
      input = parsed.data as Input;
    } else {
      input = data as Input;
    }

    try {
      const output = await resolvedHandler(input);
      return NextResponse.json(output);
    } catch (e) {
      return NextResponse.json(
        { error: { message: (e as Error).toString() } },
        { status: 500 }
      );
    }
  };
}

export default function genkitEndpoint(handler: ChatHandler): Endpoint;
export default function genkitEndpoint<T extends z.ZodTypeAny = z.ZodTypeAny>(
  options: ChatEndpointOptions<T>,
  handler: ChatHandler<z.infer<T>>
): Endpoint;
export default function genkitEndpoint<T extends z.ZodTypeAny = z.ZodTypeAny>(
  optionsOrHandler: ChatEndpointOptions<T> | ChatHandler<z.infer<T>>,
  handler?: ChatHandler<z.infer<T>>
): Endpoint {
  const options = handler ? (optionsOrHandler as ChatEndpointOptions) : {};
  handler = handler || (optionsOrHandler as ChatHandler);
  const maxBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;

  return async (request: NextRequest): Promise<NextResponse> => {
    const authError = await authorize(request);
    if (authError) return authError;

    const { data: rawData, error } = await readJsonBody(request, maxBytes);
    if (error) return error;

    const schema = options.schema || ChatRequestSchema;
    const parsed = schema.safeParse(rawData);
    if (!parsed.success) {
      return errorResponse({
        status: 400,
        message: formatValidationError(parsed.error),
      });
    }
    const data = parsed.data;

    if (process.env.NODE_ENV === "development") {
      console.dir(data, { depth: null });
    }
    try {
      const response = await handler(data);
      return new NextResponse(toReadableStream(response), {
        headers: { "content-type": "text/event-stream" },
      });
    } catch (e) {
      return new NextResponse(
        `data: ${JSON.stringify({
          error: { message: (e as Error).message },
        })}\n\n`,
        {
          headers: { "content-type": "text/event-stream" },
        }
      );
    }
  };
}
