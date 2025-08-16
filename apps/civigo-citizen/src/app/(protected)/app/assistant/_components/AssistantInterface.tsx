"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AgentRequest, AgentResponse } from "@/lib/agent/types";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  actions?: AgentResponse["actions"];
}

interface AssistantContext {
  serviceId?: string;
  branchId?: string;
  dateFromISO?: string;
  dateToISO?: string;
  isInitialMessage?: boolean;
}

export default function AssistantInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [context, setContext] = useState<AssistantContext>({});
  const [isInitialized, setIsInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (
    messageText: string,
    newContext?: Partial<AssistantContext>
  ) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const updatedContext = { ...context, ...newContext };
    setContext(updatedContext);

    try {
      const request: AgentRequest = {
        message: messageText,
        context: updatedContext,
      };

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to send message");
      }

      if (data.disabled) {
        throw new Error("AI Assistant is currently disabled");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
        actions: data.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize the conversation when component mounts
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
      // Auto-initialize the conversation with context
      const initMessage = async () => {
        setIsLoading(true);
        try {
          const request: AgentRequest = {
            message: "Hello! I need help with government services.",
            context: { isInitialMessage: true },
          };

          const response = await fetch("/api/agent", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
          });

          const data = await response.json();

          if (response.ok && !data.disabled) {
            const assistantMessage: Message = {
              id: Date.now().toString(),
              role: "assistant",
              content: data.answer,
              timestamp: new Date(),
              actions: data.actions,
            };
            setMessages([assistantMessage]);
          }
        } catch (error) {
          console.error("Error initializing chat:", error);
          // Fallback welcome message if API fails
          setMessages([{
            id: "welcome",
            role: "assistant",
            content: "Hello! I'm Nethra, your AI assistant for Civigo services. How can I help you today?",
            timestamp: new Date(),
          }]);
        } finally {
          setIsLoading(false);
        }
      };
      initMessage();
    }
  }, [isInitialized]);

  const sendMessage = async (
    messageText: string,
    newContext?: Partial<AssistantContext>
  ) => {
    if (!messageText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const updatedContext = { ...context, ...newContext };
    setContext(updatedContext);

    try {
      const request: AgentRequest = {
        message: messageText,
        context: updatedContext,
      };

      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to send message");
      }

      if (data.disabled) {
        throw new Error("AI Assistant is currently disabled");
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.answer,
        timestamp: new Date(),
        actions: data.actions,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to send message"
      );

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleSuggestedAction = (
    action: NonNullable<AgentResponse["actions"]>[0]
  ) => {
    switch (action.type) {
      case "selectBranch":
        if (action.params?.branchId && action.params?.branchName) {
          setContext((prev) => ({
            ...prev,
            branchId: action.params!.branchId,
          }));
          sendMessage(`Selected branch: ${action.params.branchName}`, {
            branchId: action.params.branchId,
          });
        }
        break;
      case "selectDateRange":
        if (action.params?.fromISO && action.params?.toISO) {
          const newContext = {
            dateFromISO: action.params.fromISO,
            dateToISO: action.params.toISO,
          };
          setContext((prev) => ({ ...prev, ...newContext }));
          sendMessage(`Selected date range`, newContext);
        }
        break;
      case "showSlots":
        sendMessage("Show me available slots", action.params);
        break;
      case "book":
        if (action.params?.slotId) {
          sendMessage(`Book slot ${action.params.slotId}`, {
            slotId: action.params.slotId,
          });
        }
        break;
      case "openService":
        if (action.params?.serviceId) {
          window.open(`/app/services/${action.params.serviceId}`, "_blank");
        }
        break;
      case "openAppointments":
        window.open("/app/appointments", "_blank");
        break;
    }
  };

  return (
    <div className="flex flex-col h-[70vh] sm:h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-white text-gray-900 shadow-sm border"
              }`}
            >
              <p className="text-sm">{message.content}</p>
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, index) => (
                    <Button
                      key={index}
                      size="sm"
                      variant="outline"
                      className="w-full text-xs sm:text-sm"
                      onClick={() => handleSuggestedAction(action)}
                    >
                      {action.type === "selectBranch" &&
                        `Select ${action.params?.branchName}`}
                      {action.type === "selectDateRange" && "Select Date Range"}
                      {action.type === "showSlots" && "Show Available Slots"}
                      {action.type === "book" && "Book This Slot"}
                      {action.type === "openService" && "View Service Details"}
                      {action.type === "openAppointments" &&
                        "View My Appointments"}
                    </Button>
                  ))}
                </div>
              )}
              <p className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-gray-900 shadow-sm border px-4 py-2 rounded-lg">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Context Display */}
      {(context.serviceId || context.branchId || context.dateFromISO) && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-4">
          <p className="text-sm text-blue-800 font-medium">Current Context:</p>
          <div className="text-xs sm:text-sm text-blue-600 mt-1 space-y-1">
            {context.serviceId && <div>Service: {context.serviceId}</div>}
            {context.branchId && <div>Branch: {context.branchId}</div>}
            {context.dateFromISO && context.dateToISO && (
              <div>
                Dates: {new Date(context.dateFromISO).toLocaleDateString()} -{" "}
                {new Date(context.dateToISO).toLocaleDateString()}
              </div>
            )}
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs sm:text-sm text-blue-600 p-0 h-auto mt-2"
            onClick={() => setContext({})}
          >
            Clear Context
          </Button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex space-x-2 mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me about appointments, documents, or services..."
          disabled={isLoading}
          className="flex-1 text-sm sm:text-base"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-4 sm:px-6"
        >
          Send
        </Button>
      </form>

      {/* Quick Actions */}
      <div className="mt-4 space-y-2">
        <p className="text-sm font-medium text-gray-700">Quick Actions:</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => sendMessage("What appointments do I have?")}
            disabled={isLoading}
            className="w-full text-xs sm:text-sm"
          >
            My Appointments
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => sendMessage("What documents do I have?")}
            disabled={isLoading}
            className="w-full text-xs sm:text-sm"
          >
            My Documents
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => sendMessage("Help me book an appointment")}
            disabled={isLoading}
            className="w-full text-xs sm:text-sm"
          >
            Book Appointment
          </Button>
        </div>
      </div>
    </div>
  );
}
