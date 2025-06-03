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

import * as React from "react";
import { usePathname } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import Image from "next/image";
import Link from "next/link";
import { demos } from "@/data";
import { BookText, Github, Lightbulb, Newspaper } from "lucide-react";

const genkitLinks = [
  {
    url: "https://github.com/genkit-ai/genkit-by-example/issues/new?template=suggest-idea-for-example.md",
    label: "Suggest an Idea",
    icon: Lightbulb,
  },
  {
    url: "https://genkit.dev",
    label: "Documentation",
    icon: BookText,
  },
  {
    url: "https://github.com/firebase/genkit",
    label: "GitHub",
    icon: Github,
  },
  {
    url: "https://firebase.blog/category/genkit",
    label: "Blog",
    icon: Newspaper,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex justify-center">
                <Image
                  src="/genkit_logo.png"
                  alt="Genkit logo"
                  width={28}
                  height={28}
                />
                <div className="flex flex-col leading-none">
                  <span className="font-bold text-xl">
                    Genkit{" "}
                    <span className="text-sm text-sidebar-primary-foreground/60">
                      by Example
                    </span>
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {demos.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === `/${item.id}`}
                >
                  <Link href={`/${item.id}`}>{item.name}</Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarMenu className="gap-2">
            {genkitLinks.map((link, i) => (
              <SidebarMenuItem key={i}>
                <SidebarMenuButton>
                  <a
                    href={link.url}
                    className="flex items-center"
                    target="_blank"
                  >
                    {<link.icon className="w-4 h-4 mr-1" />}
                    <span>{link.label}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
