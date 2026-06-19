"use client";

import Chat from "@/components/chat";
import type { Answer, Question } from "./schema";
import type { MessageData, Part, ToolResponsePart } from "genkit";
import useAgent from "@/lib/use-agent";
import QuestionForm from "./question-form";
import { withBasePath } from "@/lib/constants";

function findResponse(
  request: Part,
  message?: MessageData
): ToolResponsePart | undefined {
  return message?.content.find(
    (p) =>
      p.toolResponse?.name === request.toolRequest?.name &&
      p.toolResponse?.ref === request.toolRequest?.ref
  ) as ToolResponsePart | undefined;
}

export default function HitlChatbotApp() {
  const agent = useAgent({ endpoint: withBasePath("/chatbot-hitl/api") });

  return (
    <Chat
      agent={agent as any}
      renderPart={(part, info) => {
        if (info.message.role === "system") return <></>;
        if ("toolRequest" in part && part.toolRequest?.name === "askQuestion") {
          return (
            <QuestionForm
              question={part.toolRequest.input as Question}
              answer={
                findResponse(part, info.messages[info.messageIndex + 1])
                  ?.toolResponse?.output as Answer
              }
              send={(answer: Answer) =>
                agent.send({
                  messages: agent.messages,
                  resume: {
                    respond: [
                      {
                        toolResponse: {
                          ref: part.toolRequest!.ref,
                          name: part.toolRequest!.name,
                          output: answer,
                        },
                      },
                    ],
                  },
                })
              }
            />
          );
        }
        return null;
      }}
    />
  );
}
