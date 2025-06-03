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
import { genkit, ToolAction } from "genkit/beta";
import { googleAI } from "@genkit-ai/googleai";
import { mcpClient } from "genkitx-mcp";

const firebaseMcp = mcpClient({
  name: "firebase",
  serverProcess: {
    command: "firebase",
    args: ["experimental:mcp"],
  },
});

const ai = genkit({
  plugins: [googleAI(), firebaseMcp], // set the GOOGLE_API_KEY env variable
  model: googleAI.model("gemini-2.0-flash"),
});

export const POST = genkitEndpoint(async ({ system, messages, prompt }) => {
  const tools: ToolAction[] = [];
  const actions = await ai.registry.listActions();
  for (const key in actions) {
    if (key.startsWith("/tool/")) tools.push(actions[key] as ToolAction);
  }
  const chat = ai.chat({ system, messages, tools });
  return chat.sendStream({ prompt });
});
