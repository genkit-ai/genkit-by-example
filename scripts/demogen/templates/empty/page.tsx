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

import Demo from "@/components/demo";
import {{DEMO_ID_TITLECASE}}App from "./app";
import { demoMetadata } from "@/lib/demo-metadata";

export const generateMetadata = demoMetadata("{{DEMO_ID}}");

export default async function Page() {
  return (
    <Demo id="{{DEMO_ID}}">
      <{{DEMO_ID_TITLECASE}}App />
    </Demo>
  );
}
