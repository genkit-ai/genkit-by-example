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

"use client";

import { post, simplePost } from "@/lib/utils";
import { useState, useRef, useContext, useEffect } from "react";
import React from "react";
import type { ImageObject } from "./schema";
import { ArrowLeft, Image, UploadCloud } from "lucide-react";
import Link from "next/link";
import ImageField from "./image-field";
import HighlightArea from "./highlight-area";
import DemoConfig from "@/lib/demo-config";
import useAgent from "@/lib/use-agent";
import { withBasePath } from "@/lib/constants";

function fileToDataUri(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string); // This is the data URI
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

interface Analysis {
  objects: ImageObject[];
}

export default function ImageAnalysisApp() {
  const { config } = useContext(DemoConfig);

  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [selectedObject, setSelectedObject] = useState<ImageObject | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [sampleImage, setSampleImage] = useState<File | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  // Sample images
  const sampleImages = [
    { name: "Bird in Tree", path: withBasePath("/image-analysis/bird_in_tree.png") },
    { name: "Desk Items", path: withBasePath("/image-analysis/desk_items.jpg") },
  ];

  function borderColor(o: Partial<ImageObject>) {
    let color = selectedObject === o ? o.colors?.[0] : "transparent";
    if (color === "black") color = "white";
    return color;
  }

  async function analyzeImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setAnalysis(null);
    setSelectedObject(null);
    if (!file) {
      setLoading(false);
      return;
    }

    try {
      const analysis = await simplePost<
        { imageUrl: string; system: any },
        Analysis
      >(withBasePath("/image-analysis/api"), {
        system: config?.system,
        imageUrl: await fileToDataUri(file),
      });
      setAnalysis(analysis);
    } finally {
      setLoading(false);
    }
  }

  // Function to load a sample image
  async function loadSampleImage(imagePath: string) {
    try {
      setAnalysis(null);
      setSelectedObject(null);
      setLoading(true);
      const response = await fetch(imagePath);
      const blob = await response.blob();

      // Create a File object from the blob
      const filename = imagePath.split("/").pop() || "sample-image.png";
      const file = new File([blob], filename, {
        type: blob.type || "image/png",
      });

      // Set the sample image which will be passed to ImageField
      setSampleImage(file);

      // Note: The actual analysis will be triggered by the ImageField's onChange handler
      // when it receives the new image prop
    } catch (error) {
      console.error("Error loading sample image:", error);
      setLoading(false);
    }
  }

  return (
    <>
      <div>
        <form ref={formRef}>
          <div className="relative w-full max-w-xl mx-auto mt-16">
            <ImageField
              name="image"
              onChange={analyzeImage}
              image={sampleImage}
              onClear={() => {
                setSampleImage(null);
                setAnalysis(null);
                setSelectedObject(null);
              }}
              showClearButton={!loading && analysis !== null}
            />
            {selectedObject && <HighlightArea bounds={selectedObject} />}

            {/* Sample Images */}
            {!loading && !analysis && (
              <div className="mt-6">
                <h3 className="text-center text-sm mb-3">
                  Or try a sample image:
                </h3>
                <div className="flex justify-center gap-4">
                  {sampleImages.map((image, index) => (
                    <div
                      key={index}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => loadSampleImage(image.path)}
                    >
                      <img
                        src={image.path}
                        alt={image.name}
                        className="w-24 h-24 object-cover rounded-lg border-2 border-slate-700"
                      />
                      <p className="text-xs text-center mt-1">{image.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>
        {(loading || analysis) && (
          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div
                role="status"
                className="border border-slate-700 animate-pulse rounded-xl mt-8 max-w-sm text-center flex items-center justify-center mx-auto p-6"
              >
                <Image />
                <span className="ml-2">Analyzing Image&hellip;</span>
              </div>
            )}
            {analysis && (
              <div className="p-4 rounded-xl max-w-3xl mx-auto">
                <p className="text-center mb-4 text-sm">
                  Click an item to highlight it in the image&hellip;
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analysis.objects?.map((o, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg shadow-md hover:shadow-lg border-2 border-slate-700 transition-shadow duration-300"
                      style={{ borderColor: borderColor(o) }}
                      onClick={() => {
                        if (selectedObject === o) {
                          setSelectedObject(null);
                          return;
                        }
                        setSelectedObject(o);
                        console.log(o);
                      }}
                    >
                      <h3 className="text-lg font-semibold mb-2">{o.name}</h3>
                      <p className="text-sm">{o.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
