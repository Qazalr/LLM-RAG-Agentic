"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Menu,
  Plus,
  MessageSquare,
  Send,
  User,
  Bot,
  ChevronDown,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { sendChatMessage, streamChatMessage } from "@/lib/api";
import {
  saveConversation,
  loadConversation,
  getConversationHistory,
  clearConversation,
} from "@/lib/storage";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const MODEL_OPTIONS = ["GPT-4", "Claude 3.5 Sonnet", "Gemini Pro 1.5"];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationId = useRef<string>(`conv_${Date.now()}`);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle Input Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);

    const messageContent = input;
    setInput("");
    setLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      let assistantMessage = "";
      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const stream = streamChatMessage({
        message: messageContent,
        conversationId: conversationId.current
      });

      for await (const chunk of stream) {
        assistantMessage += chunk;
        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMsg = newMessages[newMessages.length - 1];
          if (lastMsg.role === "assistant") {
            lastMsg.content = assistantMessage;
          }
          return newMessages;
        });
      }

      saveConversation(conversationId.current, [...messages, userMessage, { role: 'assistant', content: assistantMessage }]);

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMsg = newMessages[newMessages.length - 1];
        if (lastMsg.role === "assistant") {
          lastMsg.content = "Error: Failed to get response.";
        }
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const startNewChat = () => {
    conversationId.current = `conv_${Date.now()}`;
    setMessages([]);
    setSidebarOpen(false); // On mobile, close sidebar
    setTimeout(() => setSidebarOpen(true), 10); // Re-open if needed or handle better for mobile
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "w-[260px]" : "w-0"
          } bg-[#171717] transition-all duration-300 ease-in-out flex flex-col border-r border-[#2f2f2f] relative`}
      >
        <div className="p-3 flex-none">
          <button
            onClick={startNewChat}
            className="flex items-center gap-3 w-full px-3 py-3 rounded-lg border border-[#444] hover:bg-[#2f2f2f] transition-colors text-sm text-white"
          >
            <Plus size={16} />
            Target New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="text-xs font-semibold text-[#8e8e93] mb-3 px-2">Recent</div>
          {/* Example History Items - In a real app, map these from storage */}
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#ececec] hover:bg-[#2f2f2f] rounded-lg cursor-pointer truncate">
            <MessageSquare size={16} className="text-[#8e8e93]" />
            <span className="truncate">Quantum Physics Info</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 text-sm text-[#ececec] hover:bg-[#2f2f2f] rounded-lg cursor-pointer truncate">
            <MessageSquare size={16} className="text-[#8e8e93]" />
            <span className="truncate">React Components</span>
          </div>
        </div>

        <div className="p-3 border-t border-[#2f2f2f]">
          <div className="flex items-center gap-3 px-3 py-3 hover:bg-[#2f2f2f] rounded-lg cursor-pointer">
            <div className="w-8 h-8 rounded bg-purple-600 flex items-center justify-center text-white font-bold">
              R
            </div>
            <div className="flex-1 text-sm font-medium">User Account</div>
            <MoreHorizontal size={16} className="text-[#8e8e93]" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[#2f2f2f] bg-[#212121]">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-[#2f2f2f] rounded-lg text-[#ececec]">
              <Menu size={20} />
            </button>
            <div className="relative">
              <button
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="flex items-center gap-2 text-lg font-semibold hover:bg-[#2f2f2f] px-3 py-1 rounded-lg transition-colors"
              >
                {selectedModel} <ChevronDown size={16} className="text-[#8e8e93]" />
              </button>
              {/* Simplified Dropdown */}
              {isModelDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-[#2f2f2f] border border-[#444] rounded-lg shadow-xl z-50">
                  {MODEL_OPTIONS.map(model => (
                    <div
                      key={model}
                      className="px-4 py-2 hover:bg-[#444] cursor-pointer text-sm first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => { setSelectedModel(model); setIsModelDropdownOpen(false); }}
                    >
                      {model}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 flex flex-col gap-6">
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-6">
                <Bot size={32} className="text-black" />
              </div>
              <h2 className="text-2xl font-bold mb-2">How can I help you today?</h2>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-4 max-w-3xl mx-auto w-full ${msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
              >
                {msg.role === "assistant" && (
                  <div className="w-8 h-8 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center">
                    <Bot size={18} className="text-white" />
                  </div>
                )}

                <div
                  className={`px-5 py-3 rounded-2xl max-w-[85%] leading-7 ${msg.role === "user"
                    ? "bg-[#2f2f2f] text-white rounded-br-none"
                    : "text-[#ececec]" // Assistant messages are plain text, no bubble bg
                    }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-invert max-w-none text-sm md:text-base"
                    components={{
                      code(props) {
                        const { children, className, node, ...rest } = props
                        return <code {...rest} className={`${className} bg-black/30 rounded px-1`}>{children}</code>
                      },
                      pre(props) {
                        const { children, className, ...rest } = props
                        return <pre {...rest} className={`${className} bg-[#1e1e1e] p-4 rounded-lg overflow-x-auto border border-[#444]`}>{children}</pre>
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>

                {msg.role === "user" && (
                  <div className="w-8 h-8 rounded-full bg-[#444] flex-shrink-0 flex items-center justify-center">
                    <User size={18} className="text-white" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#212121] md:bg-transparent md:absolute md:bottom-0 md:left-0 md:right-0 md:from-[#212121] md:via-[#212121] md:to-[#212121]">
          <div className="max-w-3xl mx-auto relative bg-[#2f2f2f] rounded-xl border border-[#444] shadow-lg flex items-end p-2 md:p-3 focus-within:border-[#666] transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Chatly..."
              rows={1}
              className="w-full bg-transparent border-none outline-none resize-none mx-2 py-3 text-white max-h-48 overflow-y-auto"
              style={{ minHeight: "44px" }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`p-2 rounded-lg mb-1 transition-all duration-200 ${input.trim()
                ? "bg-white text-black hover:bg-gray-200"
                : "bg-[#444] text-[#888] cursor-not-allowed"
                }`}
            >
              <Send size={18} />
            </button>
          </div>
          <div className="text-center text-xs text-[#666] mt-2 pb-2">
            Chatly can make mistakes. Consider checking important information.
          </div>
        </div>
      </div>
    </div>
  );
}
