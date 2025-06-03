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
import React from "react";
import Chat from "@/components/chat";
import { Sun, Cloud, CloudRain, CloudSnow } from "lucide-react";
import Dice from "./dice-roll";

function WeatherResponse({
  temperature,
  condition,
}: {
  temperature: number;
  condition: "sunny" | "cloudy" | "rainy" | "snowy";
}) {
  let icon: React.ReactNode = <Sun />;
  switch (condition) {
    case "cloudy":
      icon = <Cloud />;
      break;
    case "rainy":
      icon = <CloudRain />;
      break;
    case "snowy":
      icon = <CloudSnow />;
      break;
  }

  return (
    <div className=" mb-4 border-2 border-zinc-700 p-4 pb-3 rounded-xl">
      <div className="flex items-center gap-2">
        <span className="text-xl">{temperature}°F</span>
        <span className="text-xl">{icon}</span>
      </div>
      <div className="text-xs text-primary/50 text-center mt-1">(not real)</div>
    </div>
  );
}

function DiceResponse({ output }: { output: number }) {
  const [number, setNumber] = React.useState(output);
  const [rolling, setRolling] = React.useState(true);

  React.useEffect(() => {
    if (!rolling) return;
    const rolls = Array.from({ length: 10 }, (_, i) =>
      setTimeout(() => setNumber(Math.floor(Math.random() * 6) + 1), i * 100)
    );
    setTimeout(() => {
      setRolling(false);
      setNumber(output);
    }, 1000);
    return () => rolls.forEach(clearTimeout);
  }, [output]);

  return (
    <Dice
      value={number}
      className={"mb-4" + (rolling ? "animate-shake" : "")}
    />
  );
}

export default function ToolCallingChatbotApp() {
  return (
    <Chat
      endpoint="/mcp/api"
      renderPart={(part) => {
        if (part.toolResponse?.name === "getWeather")
          return <WeatherResponse {...(part.toolResponse.output as any)} />;
        if (part.toolResponse?.name === "rollDice")
          return <DiceResponse output={part.toolResponse.output as any} />;
        return null;
      }}
    />
  );
}
