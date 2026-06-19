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

/**
 * Base path for the application - must match next.config.ts basePath
 */
export const BASE_PATH = "/examples";

/**
 * Default base URL for the application (used in development)
 * In production, SITE_ORIGIN env var should be set in apphosting.yaml
 */
export const DEFAULT_BASE_URL = `http://localhost:3000${BASE_PATH}`;

/**
 * Get the site origin (production or development)
 */
export const SITE_ORIGIN = process.env.SITE_ORIGIN || DEFAULT_BASE_URL;

/**
 * Helper to create paths with the basePath prefix
 * Use this for any hardcoded paths that need the basePath added
 */
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}

