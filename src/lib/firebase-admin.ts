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

import { initializeApp, getApps, getApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { getAuth } from "firebase-admin/auth";

const projectId = process.env.GCLOUD_PROJECT || "genkit-by-example";
let admin = getApps().length
  ? getApp()
  : initializeApp({
    projectId,
    databaseURL: `https://${projectId}-default-rtdb.firebaseio.com/`,
  });

export const adminRtdb = getDatabase(admin);
export const adminAuth = getAuth(admin);
