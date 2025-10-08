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

import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";
import { SITE_ORIGIN } from "@/lib/constants";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get("title") || "Genkit Demo";

    // Construct the image
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            backgroundColor: "#121212",
            padding: "40px",
            color: "white",
            fontFamily: "Nunito Sans", // Use Nunito Sans font (default)
            backgroundImage: `url(${SITE_ORIGIN}/og_bg.png)`,
          }}
        >
          <h1
            style={{
              paddingTop: "240px",
              fontSize: "64px",
              color: "#ffcc99",
            }}
          >
            <div
              style={{
                padding: "20px 30px",
                backgroundColor: "#00000055",
                borderRadius: "20px",
                border: "5px solid #ffcc9977",
              }}
            >
              {title}
            </div>
          </h1>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "cache-control": "public, max-age=86400",
        },
      }
    );
  } catch (error) {
    console.error("Error generating OG image:", error);
    return new Response("Error generating image", { status: 500 });
  }
}
