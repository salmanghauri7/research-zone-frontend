"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Paper } from "@/components/saved-papers/types";
import { ChatMessage } from "./types";
import { paperChatApi } from "@/api/paperChatApi";
import { useNotification } from "@/contexts/NotificationContext";

import PaperPicker from "./PaperPicker";
import WelcomeView from "./WelcomeView";
import PaperContextBar from "./PaperContextBar";
import ChatMessages from "./ChatMessages";
import ChatInput from "./ChatInput";
import SuggestedPrompts from "./SuggestedPrompts";

interface PaperChatContainerProps {
  workspaceId: string;
}

export default function PaperChatContainer({
  workspaceId,
}: PaperChatContainerProps) {
  const { showError } = useNotification();

  const [selectedPaper, setSelectedPaper] = useState<Paper | null>(null);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);

  const handleSelectPaper = useCallback(
    async (paper: Paper) => {
      setIsPickerOpen(false);
      setMessages([]);
      setSessionId(null);
      setIsGeneratingEmbeddings(true);

      try {
        const result = await paperChatApi.generateEmbeddings(
          paper._id,
          paper.link,
        );

        // Handle existing conversation history if any
        const historyMessages = result?.data?.messages || result?.messages;
        if (historyMessages && Array.isArray(historyMessages)) {
          const formattedHistory = historyMessages.map((msg: any) => ({
            id: msg._id || `${msg.role}-${Date.now()}-${Math.random()}`,
            role: msg.role === "system" ? "assistant" : msg.role,
            content: msg.message || msg.content,
            timestamp: new Date(msg.createdAt || Date.now()),
          }));
          setMessages(formattedHistory);
        }

        setSelectedPaper(paper);
      } catch (err) {
        console.error("Error generating embeddings:", err);
        showError("Failed to prepare paper for chat. Please try again.");
      } finally {
        setIsGeneratingEmbeddings(false);
      }
    },
    [showError],
  );

  const handleClosePaper = useCallback(() => {
    setSelectedPaper(null);
    setMessages([]);
    setSessionId(null);
  }, []);

  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!selectedPaper) return;

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsWaitingResponse(true);

      try {
        const responseData = await paperChatApi.askQuestion(
          selectedPaper._id,
          content,
        );

        const assistantMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          role: "assistant",
          content: responseData?.answer || "No answer provided.",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        console.error("Error asking question:", err);
        showError("Failed to get a response. Please try again.");

        // Add error message
        const errorMessage: ChatMessage = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content:
            "Sorry, I encountered an error processing your request. Please try again.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsWaitingResponse(false);
      }
    },
    [selectedPaper, workspaceId, sessionId, showError],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[var(--bg-primary)] overflow-hidden relative">
      <AnimatePresence mode="wait">
        {!selectedPaper ? (
          /* Welcome State — No Paper Selected */
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col h-full absolute inset-0 w-full"
          >
            <WelcomeView
              onOpenPicker={() => setIsPickerOpen(true)}
              isGeneratingEmbeddings={isGeneratingEmbeddings}
            />
          </motion.div>
        ) : (
          /* Chat State — Paper Selected */
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col h-full absolute inset-0 w-full bg-[var(--bg-primary)] z-10"
          >
            {/* Paper Context */}
            <div className="shrink-0 z-20">
              <PaperContextBar
                paper={selectedPaper}
                onChangePaper={() => setIsPickerOpen(true)}
                onClose={handleClosePaper}
              />
            </div>

            {/* Chat Area */}
            <div className="flex-1 min-h-0 relative flex flex-col z-0">
              {messages.length === 0 && !isWaitingResponse ? (
                <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                  <SuggestedPrompts onSelect={handleSendMessage} />
                </div>
              ) : (
                <ChatMessages
                  messages={messages}
                  isWaitingResponse={isWaitingResponse}
                />
              )}
            </div>

            {/* Input */}
            <div className="shrink-0 z-20">
              <ChatInput
                onSend={handleSendMessage}
                isDisabled={isWaitingResponse}
                placeholder={`Ask about "${selectedPaper.title.substring(0, 40)}${selectedPaper.title.length > 40 ? "..." : ""}"...`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Paper Picker Slide-Over */}
      <PaperPicker
        workspaceId={workspaceId}
        onSelect={handleSelectPaper}
        onClose={() => setIsPickerOpen(false)}
        isOpen={isPickerOpen}
      />
    </div>
  );
}
