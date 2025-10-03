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

import { Card } from "@/components/ui/card";
import { demos } from "@/data";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SITE_ORIGIN } from "@/lib/constants";

export const metadata: Metadata = {
	title: "Add GenAI to your web/mobile app",
	description:
		"Pre-built examples of using Genkit to build a variety of AI-powered features for Next.js applications.",
	openGraph: {
		images: [
			`${SITE_ORIGIN}/api/og?title=Practical%20GenAI%20 Demos`,
		],
	},
};

export default function Home() {
	return (
		<div className="my-4 max-w-screen-md mx-auto p-4">
			<h1 className="text-4xl text-center sm:mt-6 mb-4 font-semibold flex justify-center">
				<Image src="/banner.png" alt="Genkit" width={600} height={200} />
			</h1>
			<p>
				<b>Genkit by Example</b> is a collection of pre-built examples of using
				Genkit to build a variety of AI-powered features for Next.js
				applications.
			</p>
			<p className="mt-4">
				Each example highlights a specific feature or pattern of Genkit and
				includes source code references and a working demo. Choose an example
				from the menu on the left or click a link below to get started:
			</p>
			<div className="p-4 mt-6 grid grid-cols-2 max-sm:grid-cols-1">
				{demos.map((d) => (
					<Link href={`/${d.id}`} key={d.id}>
						<Card className="p-2 sm:mx-2 my-4 hover:bg-purple-500/10">
							<h4 className="text-nowrap block p-2 text-purple-200 rounded-lg">
								{d.name}
							</h4>
							<p className="text-sm p-2">{d.description}</p>
						</Card>
					</Link>
				))}
			</div>
		</div>
	);
}
