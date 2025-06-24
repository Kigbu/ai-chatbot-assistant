"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  X,
  MessageCircle,
  Send,
  Loader2,
  ArrowDownCircleIcon,
  SendIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import LandingSections from "@/components/LandingSections";

export default function Chat() {
  const [isChatOpen, setIsChatOpen] = React.useState<boolean>(false);
  const [showChatIcon, setShowChatIcon] = React.useState<boolean>(false);

  const chatIconRef = React.useRef<HTMLButtonElement>(null);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
    reload,
    error,
  } = useChat({ api: "/api/gemini" });

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowChatIcon(true);
      } else {
        setShowChatIcon(false);
        setIsChatOpen(false);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);

    return () => window.addEventListener("scroll", handleScroll);
  }, []);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChat = () => setIsChatOpen(!isChatOpen);

  return (
    <div className="flex flex-col min-h-screen">
      <LandingSections />

      <AnimatePresence>
        {showChatIcon && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-4 right-4 z-50 "
          >
            <Button ref={chatIconRef} onClick={toggleChat}>
              {!isChatOpen ? (
                <MessageCircle className="size-12" />
              ) : (
                <ArrowDownCircleIcon />
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 0.8 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-4 z-50 w-[95%] md:w-[500px] "
          >
            <Card className="border-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 ">
                <CardTitle className="text-lg font-bold">
                  Chat With NoteWorthy
                </CardTitle>

                <Button
                  onClick={toggleChat}
                  size={"sm"}
                  variant={"ghost"}
                  className="px-2 py-0 "
                >
                  <X className="size-4" />
                  <span className="sr-only">close chat</span>
                </Button>
              </CardHeader>

              <CardContent className="">
                <ScrollArea className="h-[300px] pr-4 ">
                  {messages.length > 0 ? (
                    messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 items-center ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            message.role === "user"
                              ? "bg-blue-500 text-white my-1"
                              : "bg-gray-200 text-gray-800 my-1"
                          }`}
                        >
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code: ({
                                node,
                                inline,
                                className,
                                children,
                                ...props
                              }) => {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );
                                return !inline && match ? (
                                  <code
                                    {...props}
                                    className={`text-sm font-mono ${match[1]}`}
                                  >
                                    {children}
                                  </code>
                                ) : (
                                  <pre {...props}>
                                    <code className="text-sm font-mono">
                                      {children}
                                    </code>
                                  </pre>
                                );
                              },
                              ul: ({ children }) => (
                                <ul className="list-disc ml-4">{children}</ul>
                              ),
                              li: ({ children }) => (
                                <li className="list-decimal ml-4 py-2">
                                  {children}
                                </li>
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="w-full mt-32 text-gray-600 items-center justify-center flex gap-3">
                      No messages yet.
                    </div>
                  )}

                  {isLoading && (
                    <div className="w-full mt-32 text-gray-600 items-center justify-center flex gap-3">
                      <Loader2 className="size-8 animate-spin" />
                      <Button onClick={() => stop()} className="underline">
                        Stop
                      </Button>
                    </div>
                  )}
                  {error && (
                    <div className="w-full mt-32 text-gray-600 items-center justify-center flex gap-3">
                      <Button onClick={() => reload()} className="underline">
                        Reload
                      </Button>
                    </div>
                  )}
                  <div ref={scrollRef}></div>
                </ScrollArea>
              </CardContent>
              <CardFooter>
                <form
                  action=""
                  onSubmit={handleSubmit}
                  className="flex w-full items-center space-x-2 "
                >
                  <Input
                    value={input}
                    onChange={handleInputChange}
                    className="flex-1"
                    placeholder="Type your message"
                  />
                  <Button
                    type="submit"
                    className="size-9"
                    disabled={isLoading}
                    size={"icon"}
                  >
                    <Send className="size-4" />
                  </Button>
                </form>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
