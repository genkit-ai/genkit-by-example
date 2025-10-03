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
 * Custom image loader to handle basePath correctly.
 * 
 * Next.js Image Optimization has known issues with basePath where the optimizer
 * doesn't fetch source images from the correct basePath location, resulting in
 * 400 errors. This custom loader bypasses optimization and serves images directly.
 * 
 * Related: https://github.com/vercel/next.js/issues/68498
 */
export default function imageLoader({ src }: { src: string }) {
  return `/examples${src}`;
}

