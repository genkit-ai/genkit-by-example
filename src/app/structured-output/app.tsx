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

import { post } from "@/lib/utils";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { CharacterSheet } from "./schema";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import React from "react";
import { withBasePath } from "@/lib/constants";

export default function StructuredOutputApp() {
	const [prompt, setPrompt] = useState<string>("");
	const [character, setCharacter] =
		useState<Partial<CharacterSheet | null>>(null);
	const [isLoading, setIsLoading] = useState(false);
	const promptTextAreaRef = useRef<HTMLTextAreaElement>(null);

	const PulseDot = () => {
		return (
			isLoading && (
				<span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500">
					<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-500 opacity-75"></span>
				</span>
			)
		);
	};

	const generateCharacter = async (prompt: string) => {
		setIsLoading(true);
		const stream = post<
			{ prompt: string },
			{ output: Partial<CharacterSheet> }
		>(withBasePath("/structured-output/api"), {
			prompt,
		});
		for await (const chunk of stream) {
			if (chunk.message) setCharacter(chunk.message.output);
		}
		setIsLoading(false);
	};

	return (
		<div className="w-full h-full overflow-y-auto">
			<div className="container mx-auto p-4 max-w-screen-sm">
				<h1 className="text-2xl text-center font-bold mb-4">
					D&D Character Generator
				</h1>
				{!character ? (
					<div className="flex flex-col gap-4 mx-auto">
						<div className="flex flex-col">
							<Label htmlFor="prompt" className="text-lg mb-2 text-gray-100">
								Character Prompt
							</Label>
							<Textarea
								id="prompt"
								rows={4}
								className="bg-gray-800 border-gray-700 text-white rounded-md shadow-sm focus:ring-sky-500 focus:border-sky-500"
								value={prompt}
								onChange={(e) => setPrompt(e.target.value)}
							/>
						</div>
						<Button
							variant="outline"
							className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
							onClick={() => generateCharacter(prompt)}
							disabled={isLoading}
						>
							{isLoading ? "Generating..." : "Generate Character"}
						</Button>
					</div>
				) : (
					<div className="flex flex-col gap-4">
						<div className="text-sm text-gray-400 italic">Prompt: {prompt}</div>
						<Button
							variant="outline"
							className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
							onClick={() => {
								setCharacter(null);
								setPrompt(""); // Clear the textarea
							}}
						>
							Reset
						</Button>
						<Card className="bg-gray-900 border-gray-700 rounded-lg shadow-md">
							<CardHeader className="px-4 py-2 bg-gray-800 border-b border-gray-700">
								<CardTitle className="text-xl font-bold">
									Character Sheet
								</CardTitle>
							</CardHeader>
							<CardContent className="grid gap-4 p-4">
								{character && (
									<>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<h3 className="text-lg font-semibold text-purple-200">
													Character Info
												</h3>
												<div className="grid grid-cols-2 gap-2">
													<span className="font-semibold">Name:</span>{" "}
													<span>{character.name || <PulseDot />}</span>
													<span className="font-semibold">Race:</span>{" "}
													<span>{character.race || <PulseDot />}</span>
													<span className="font-semibold">Class:</span>{" "}
													<span>{character.class || <PulseDot />}</span>
													<span className="font-semibold">Level:</span>{" "}
													<span>{character.level || <PulseDot />}</span>
													<span className="font-semibold">Experience:</span>{" "}
													<span>
														{character.experiencePoints || <PulseDot />}
													</span>
												</div>
											</div>
											<div>
												<h3 className="text-lg font-semibold text-purple-200">
													Ability Scores
												</h3>
												<div className="grid grid-cols-2 gap-2">
													<span className="font-semibold">Strength:</span>{" "}
													<span>
														{character.abilityScores?.strength || <PulseDot />}
													</span>
													<span className="font-semibold">Dexterity:</span>{" "}
													<span>
														{character.abilityScores?.dexterity || <PulseDot />}
													</span>
													<span className="font-semibold">Constitution:</span>{" "}
													<span>
														{character.abilityScores?.constitution || (
															<PulseDot />
														)}
													</span>
													<span className="font-semibold">Intelligence:</span>{" "}
													<span>
														{character.abilityScores?.intelligence || (
															<PulseDot />
														)}
													</span>
													<span className="font-semibold">Wisdom:</span>{" "}
													<span>
														{character.abilityScores?.wisdom || <PulseDot />}
													</span>
													<span className="font-semibold">Charisma:</span>{" "}
													<span>
														{character.abilityScores?.charisma || <PulseDot />}
													</span>
												</div>
											</div>
										</div>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div>
												<h3 className="text-lg font-semibold text-purple-200">
													Combat Stats
												</h3>
												<div className="grid grid-cols-2 gap-2">
													<span className="font-semibold">Hit Points:</span>{" "}
													<span>{character.hitPoints || <PulseDot />}</span>
													<span className="font-semibold">Armor Class:</span>{" "}
													<span>{character.armorClass || <PulseDot />}</span>
													<span className="font-semibold">Speed:</span>{" "}
													<span>{character.speed || <PulseDot />}</span>
												</div>
											</div>
											<div>
												<h3 className="text-lg font-semibold text-purple-200">
													Background
												</h3>
												<div className="grid grid-cols-2 gap-2">
													<span className="font-semibold">Alignment:</span>{" "}
													<span>{character.alignment || <PulseDot />}</span>
													<span className="font-semibold">Background:</span>{" "}
													<span>{character.background || <PulseDot />}</span>
												</div>
											</div>
										</div>
										<div>
											<h3 className="text-lg font-semibold text-purple-200">
												Skills and Proficiencies
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
												<div>
													<span className="font-semibold">Proficiencies:</span>{" "}
													<span>
														{character.proficiencies?.join(", ") || (
															<PulseDot />
														)}
													</span>
												</div>
												<div>
													<span className="font-semibold">Languages:</span>{" "}
													<span>
														{character.languages?.join(", ") || <PulseDot />}
													</span>
												</div>
											</div>
										</div>
										<div>
											<h3 className="text-lg font-semibold text-purple-200">
												Equipment and Inventory
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
												<div>
													<span className="font-semibold">Equipment:</span>{" "}
													<span>
														{character.equipment?.join(", ") || <PulseDot />}
													</span>
												</div>
												<div>
													<span className="font-semibold">Inventory:</span>{" "}
													<span>
														{character.inventory?.join(", ") || <PulseDot />}
													</span>
												</div>
											</div>
										</div>
										<div>
											<h3 className="text-lg font-semibold text-purple-200">
												Personal Details
											</h3>
											<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
												<div>
													<span className="font-semibold">
														Personality Traits:
													</span>{" "}
													<span>
														{character.personalityTraits || <PulseDot />}
													</span>
												</div>
												<div>
													<span className="font-semibold">Ideals:</span>{" "}
													<span>{character.ideals || <PulseDot />}</span>
												</div>
												<div>
													<span className="font-semibold">Bonds:</span>{" "}
													<span>{character.bonds || <PulseDot />}</span>
												</div>
												<div>
													<span className="font-semibold">Flaws:</span>{" "}
													<span>{character.flaws || <PulseDot />}</span>
												</div>
											</div>
										</div>
										<div>
											<h3 className="text-lg font-semibold text-purple-200">
												Notes
											</h3>
											<div>
												<span className="font-semibold">Additional Notes:</span>{" "}
												<span>{character.notes || <PulseDot />}</span>
											</div>
										</div>
									</>
								)}
							</CardContent>
						</Card>
					</div>
				)}
			</div>
		</div>
	);
}
