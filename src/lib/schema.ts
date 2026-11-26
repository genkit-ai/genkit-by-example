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

import { z, MessageSchema, PartSchema } from "genkit";
import { ToolRequestPartSchema, ToolResponsePartSchema } from "genkit/model";

const MAX_SYSTEM_CHARS = 2_000;
const MAX_PROMPT_CHARS = 4_000;
const MAX_MESSAGE_PART_CHARS = 8_000;
const MAX_MESSAGES = 20;
const MAX_PARTS_PER_MESSAGE = 20;

function validateTextOnlyParts(
  parts: z.infer<typeof PartSchema>[],
  maxTotalChars: number,
  label: string,
  ctx: z.RefinementCtx
) {
  let total = 0;
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    if ("media" in part && part.media) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [i],
        message: `Media parts are not allowed in ${label}.`,
      });
      return;
    }
    if (!("text" in part) || typeof part.text !== "string") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [i],
        message: `Only text parts are allowed in ${label}.`,
      });
      return;
    }
    total += part.text.length;
  }
  if (total > maxTotalChars) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${label} exceeds maximum length of ${maxTotalChars} characters.`,
    });
  }
}

export const GenerateRequestSchema = z.object({
  system: z
    .array(PartSchema)
    .max(4)
    .superRefine((parts, ctx) =>
      validateTextOnlyParts(parts, MAX_SYSTEM_CHARS, "system prompt", ctx)
    )
    .optional(),
  messages: z
    .array(MessageSchema)
    .max(MAX_MESSAGES)
    .superRefine((messages, ctx) => {
      for (let i = 0; i < messages.length; i++) {
        const content = messages[i].content;
        if (content.length > MAX_PARTS_PER_MESSAGE) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [i, "content"],
            message: `Message exceeds maximum of ${MAX_PARTS_PER_MESSAGE} parts.`,
          });
          return;
        }
        for (let j = 0; j < content.length; j++) {
          const part = content[j];
          if ("media" in part && part.media) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [i, "content", j],
              message: "Media parts are not allowed on text chat endpoints.",
            });
            return;
          }
          if (
            "text" in part &&
            typeof part.text === "string" &&
            part.text.length > MAX_MESSAGE_PART_CHARS
          ) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: [i, "content", j],
              message: `Message text exceeds maximum length of ${MAX_MESSAGE_PART_CHARS} characters.`,
            });
            return;
          }
        }
      }
    })
    .optional(),
  prompt: z
    .array(PartSchema)
    .max(4)
    .superRefine((parts, ctx) =>
      validateTextOnlyParts(parts, MAX_PROMPT_CHARS, "prompt", ctx)
    )
    .optional(),
  resume: z
    .object({
      respond: z.array(ToolResponsePartSchema).max(10).optional(),
      restart: z.array(ToolRequestPartSchema).max(10).optional(),
    })
    .optional(),
});
export type GenerateRequest = z.infer<typeof GenerateRequestSchema>;
