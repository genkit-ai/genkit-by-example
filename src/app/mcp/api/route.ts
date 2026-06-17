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

// !!!START

import genkitEndpoint from "@/lib/genkit-endpoint";
import { genkit } from "genkit/beta";
import { googleAI } from "@genkit-ai/google-genai";
import { defineMcpClient, GenkitMcpClient } from "@genkit-ai/mcp";

const ai = genkit({
  plugins: [googleAI()], // set the GOOGLE_API_KEY env variable
  model: googleAI.model("gemini-flash-latest"),
});

let firebaseMcp: GenkitMcpClient;

export const POST = genkitEndpoint(async ({ system, messages, prompt }) => {
  if (!firebaseMcp) {
    firebaseMcp = defineMcpClient(ai, {
      name: "firebase",
      mcpServer: {
        command: "firebase",
        args: ["experimental:mcp"],
      },
    });
  }

  const chat = ai.chat({
    system,
    messages,
    tools: await firebaseMcp.getActiveTools(ai),
  });
  return chat.sendStream({ prompt });
});
