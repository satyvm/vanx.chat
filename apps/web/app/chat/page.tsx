"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Send,
  Plus,
  MessageSquare,
  Settings,
  User,
  ChevronDown,
} from "lucide-react";

interface MessageType {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const VanxChatMonochrome = () => {
  const [messages, setMessages] = useState<MessageType[]>([
    {
      id: crypto.randomUUID(),
      type: "assistant",
      content:
        "Hello! I'm VANX.CHAT - your AI orchestra conductor. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const newMessage: MessageType = {
      id: crypto.randomUUID(),
      type: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: MessageType = {
        id: crypto.randomUUID(),
        type: "assistant",
        content:
          "I understand your request. As your AI orchestra conductor, I'm analyzing your prompt to route it to the best model for optimal results. How else can I assist you?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: crypto.randomUUID(),
        type: "assistant",
        content:
          "Hello! I'm VANX.CHAT - your AI orchestra conductor. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
    setInputValue("");
    setIsTyping(false);
  };

  const showWelcomeScreen = messages.length === 1;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center space-x-4">
            <div className="text-2xl font-bold border-2 border-dashed border-white px-3 py-1 rounded-lg">
              VANX.CHAT
            </div>
            <div className="text-white text-sm font-mono">
              STOP JUGGLING AI TOOLS.
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 bg-white text-black border-2 border-white font-bold hover:bg-black hover:text-white transition-colors rounded-lg">
              TRY VANX.CHAT
            </button>
            <div className="flex items-center space-x-1 text-sm border border-dashed border-white px-2 py-1 rounded-md">
              <span>English</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <div className="w-64 border-r border-white p-4 flex flex-col">
          <button
            onClick={handleNewChat}
            className="flex items-center space-x-2 w-full px-4 py-3 border-2 border-dashed border-white hover:bg-white hover:text-black transition-colors mb-4 rounded-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-mono">New Chat</span>
          </button>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2">
              <div className="px-4 py-3 border-2 border-white bg-white text-black rounded-lg">
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm font-mono">Current Chat</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-dashed border-white pt-4 space-y-2">
            <button className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-white hover:text-black border border-transparent hover:border-white transition-colors rounded-md">
              <Settings className="w-4 h-4" />
              <span className="text-sm font-mono">Settings</span>
            </button>
            <button className="flex items-center space-x-2 w-full px-4 py-2 hover:bg-white hover:text-black border border-transparent hover:border-white transition-colors rounded-md">
              <User className="w-4 h-4" />
              <span className="text-sm font-mono">Account</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {showWelcomeScreen ? (
            /* Welcome Screen */
            <div className="flex-1 p-8">
              <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                  <div className="border-4 border-dashed border-white p-6 mb-8 rounded-xl">
                    <h1 className="text-4xl font-bold font-mono">
                      THE FUTURE OF COLLABORATIVE AI
                    </h1>
                  </div>
                </div>

                <div className="mt-12 text-center">
                  <div className="border border-dashed border-white px-4 py-2 inline-block rounded-md">
                    <span className="font-mono text-sm">
                      THE FUTURE OF COLLABORATIVE AI
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat Interface */
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 border-2 rounded-lg ${
                        message.type === "user"
                          ? "border-white bg-white text-black"
                          : "border-dashed border-white bg-black text-white"
                      }`}
                    >
                      <p className="text-sm leading-relaxed font-mono">
                        {message.content}
                      </p>
                      <div className="border-t border-dashed border-current mt-2 pt-2">
                        <span className="text-xs font-mono">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="border-2 border-dashed border-white p-4 rounded-lg">
                      <div className="flex space-x-1">
                        <div
                          className="w-2 h-2 bg-white animate-bounce rounded-full"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-white animate-bounce rounded-full"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-white animate-bounce rounded-full"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-white p-6">
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask VANX.CHAT anything..."
                  className="w-full bg-black border-2 border-dashed border-white p-4 pr-12 text-white placeholder-white resize-none focus:outline-none focus:border-solid font-mono rounded-lg"
                  rows={3}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-3 bottom-3 p-2 bg-white text-black border-2 border-white hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="border border-dashed border-white px-2 py-1 rounded-md">
                  <span className="text-xs font-mono">
                    Press Enter to send, Shift+Enter for new line
                  </span>
                </div>
                <div className="border border-white px-2 py-1 rounded-md">
                  <span className="text-xs font-mono">
                    Powered by VANX Intelligence Router
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VanxChatMonochrome;
