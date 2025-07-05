import { streamText, Message } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { initMessages } from "@/lib/data";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || "",
});

export const runtime = "edge";

const generateId = () => Math.random().toString(36).slice(2, 15);

const buildGoogleGemAIPrompt = (messages: Message[]): Message[] => [
  {
    id: generateId(),
    role: "user",
    content: initMessages.content,
  },
  ...messages.map((message) => ({
    id: message.id || generateId(),
    role: message.role,
    content: message.content,
  })),
];

export async function POST(request: Request) {
  console.log(
    "process.env.GOOGLE_API_KEY :::: :::::  :>> ",
    process.env.GOOGLE_API_KEY
  );

  // console.log("Available models:", await google.listModels());

  const { messages } = await request.json();
  const stream = await streamText({
    model: google("gemini-1.5-flash"),
    messages: buildGoogleGemAIPrompt(messages),
    temperature: 0.7,
  });
  return stream?.toDataStreamResponse();
}
