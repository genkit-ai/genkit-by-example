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

import { notFound } from "next/navigation";

export interface DemoMetadata {
  id: string;
  name: string;
  description: string;
  tags?: string[];
  added?: string;
  complexity?: number;
  files: (string | { name: string; combine: string[] })[];
  draft?: boolean;
}

export const demos: DemoMetadata[] = [
  {
    id: "chatbot-simple",
    name: "Simple Chatbot",
    description:
      "A simple chatbot with streaming responses and a customizable system message.",
    tags: ["chat"],
    added: "2025-01-27",
    complexity: 1,
    files: [
      {
        name: "api/route.ts",
        combine: ["@/common/genkit-beta.ts", "api/route.ts"],
      },
    ],
  },
  {
    id: "structured-output",
    name: "Structured Output",
    description:
      "A D&D character generator that utilizes Genkit's structured output with incremental streaming.",
    tags: ["structured-output"],
    added: "2025-01-28",
    complexity: 1,
    files: [
      {
        name: "api/route.ts",
        combine: ["@/common/genkit.ts", "api/route.ts"],
      },
      "schema.ts",
    ],
  },
  {
    id: "image-analysis",
    name: "Image Analysis",
    description:
      "A multimodal example that identifies and draws bounding boxes around objects in an image.",
    tags: ["multimodal"],
    added: "2025-03-03",
    complexity: 2,
    files: [
      { name: "api/route.ts", combine: ["@/common/genkit.ts", "api/route.ts"] },
      "schema.ts",
    ],
  },
  {
    id: "tool-calling",
    name: "Tool Calling",
    description:
      "A chatbot with 'getWeather' and 'rollDice' tools and custom tool response rendering.",
    tags: ["tools", "chat"],
    complexity: 2,
    files: [
      {
        name: "api/route.ts",
        combine: ["@/common/genkit-beta.ts", "api/route.ts"],
      },
    ],
  },
  {
    id: "chatbot-hitl",
    name: "Human-in-the-Loop",
    description:
      "A chatbot that uses interrupts to ask the user clarifying questions.",
    tags: ["chat", "interrupts"],
    added: "2025-02-03",
    complexity: 3,
    files: [
      {
        name: "api/route.ts",
        combine: ["@/common/genkit-beta.ts", "api/route.ts"],
      },
      "constants.ts",
      "schema.ts",
    ],
    draft: true,
  },
  {
    id: "action-context",
    name: "Action Context",
    description:
      "A chatbot that uses action context to secure tool use and provide relevant context.",
    tags: ["tools", "chat", "context"],
    complexity: 2,
    files: [
      {
        name: "api/route.ts",
        combine: ["@/common/genkit-beta.ts", "api/route.ts"],
      },
      "data.ts",
    ],
  },
];

export function findDemo(id: string): DemoMetadata | undefined {
  return demos.find((d) => d.id === id);
}

export function mustFindDemo(id: string): DemoMetadata {
  const demo = findDemo(id);
  if (!demo) notFound();
  return demo;
}
