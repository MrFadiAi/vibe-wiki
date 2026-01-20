/**
 * ChatBot Component
 * AI-powered chatbot for navigating Vibe Wiki content with RAG
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { m, useAnimation } from 'framer-motion';
import {
  createConversation,
  addMessage,
  updateContext,
  trimConversation,
  parseQuery,
  searchWikiContent,
  generateResponse,
  extractTopics,
  DEFAULT_CONFIG,
} from '../lib/wiki-chatbot-utils';
import type { WikiArticle, Tutorial, LearningPath } from '../types';
import type { ChatConversation, ChatbotConfig } from '../types/wiki-chatbot';

interface ChatBotProps {
  wikiArticles: WikiArticle[];
  tutorials: Tutorial[];
  learningPaths: LearningPath[];
  config?: Partial<ChatbotConfig>;
  className?: string;
}

export function ChatBot({
  wikiArticles,
  tutorials,
  learningPaths,
  config: userConfig = {},
  className = '',
}: ChatBotProps) {
  const [conversation, setConversation] = useState<ChatConversation>(() =>
    createConversation('default', { languagePreference: 'ar' })
  );
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const config: ChatbotConfig = { ...DEFAULT_CONFIG, ...userConfig };
  const controls = useAnimation();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation.messages]);

  // Focus input when chat is opened
  useEffect(() => {
    if (isExpanded) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isExpanded]);

  const handleSendMessage = async (text?: string) => {
    const messageToSend = text ?? inputText;
    if (!messageToSend.trim()) return;

    // Add user message
    let updatedConversation = addMessage(conversation, 'user', messageToSend);
    setInputText('');

    // Parse query
    const parsedQuery = parseQuery(messageToSend, wikiArticles, tutorials, learningPaths);

    // Search wiki content
    const searchResults = searchWikiContent(
      parsedQuery,
      wikiArticles,
      tutorials,
      learningPaths,
      config.maxSources
    );

    // Simulate typing delay
    setIsTyping(true);
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);

    // Generate response
    const response = generateResponse(
      parsedQuery,
      searchResults,
      updatedConversation.context,
      config,
      parsedQuery.language
    );

    // Add assistant message
    updatedConversation = addMessage(
      updatedConversation,
      'assistant',
      response.message,
      response.sources
    );

    // Update context with extracted topics
    const topics = extractTopics(updatedConversation);
    updatedConversation = updateContext(updatedConversation, {
      recentTopics: topics.slice(-5),
    });

    // Trim conversation if needed
    updatedConversation = trimConversation(updatedConversation, config.maxMessages);

    setConversation(updatedConversation);
  };

  const handleSuggestedResponse = (suggestedText: string) => {
    handleSendMessage(suggestedText);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsExpanded(!isExpanded);
  };

  const currentLanguage = conversation.context.languagePreference;

  return (
    <div className={`fixed bottom-6 left-6 z-50 ${className}`}>
      {/* Chat Button */}
      <m.button
        onClick={toggleChat}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle chat"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {isExpanded ? (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            />
          )}
        </svg>
        {!isExpanded && (
          <span className="font-semibold">
            {currentLanguage === 'ar' ? 'مساعد Vibe Wiki' : 'Vibe Wiki Assistant'}
          </span>
        )}
      </m.button>

      {/* Chat Window */}
      {isExpanded && (
        <m.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute bottom-16 left-0 w-96 h-[600px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 011 1v3a1 1 0 01-1 1h-1v1a2 2 0 01-2 2H5a2 2 0 01-2-2v-1H2a1 1 0 01-1-1v-3a1 1 0 011-1h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2M7.5 13A1.5 1.5 0 006 14.5 1.5 1.5 0 007.5 16 1.5 1.5 0 009 14.5 1.5 1.5 0 007.5 13m9 0a1.5 1.5 0 00-1.5 1.5 1.5 1.5 0 001.5 1.5 1.5 1.5 0 001.5-1.5 1.5 1.5 0 00-1.5-1.5M12 9a5 5 0 00-5 5v1h10v-1a5 5 0 00-5-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">
                  {currentLanguage === 'ar' ? 'مساعد Vibe Wiki' : 'Vibe Wiki Assistant'}
                </h3>
                <p className="text-xs text-white/80">
                  {currentLanguage === 'ar' ? 'أسألني أي شيء!' : 'Ask me anything!'}
                </p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversation.messages.length === 0 && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-purple-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
                <p className="text-lg font-medium mb-2">
                  {currentLanguage === 'ar' ? 'مرحباً بك!' : 'Hello!'}
                </p>
                <p className="text-sm">
                  {currentLanguage === 'ar'
                    ? 'اسألني عن أدوات البرمجة بالذكاء الاصطناعي'
                    : 'Ask me about AI programming tools'}
                </p>
              </div>
            )}

            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-black/10 dark:border-white/10">
                      <p className="text-xs opacity-75 mb-1">
                        {currentLanguage === 'ar' ? 'المصادر:' : 'Sources:'}
                      </p>
                      {message.sources.map((source, idx) => (
                        <a
                          key={idx}
                          href={`/wiki/${source.slug}`}
                          className="block text-xs underline opacity-90 hover:opacity-100"
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/wiki/${source.slug}`;
                          }}
                        >
                          {source.title}
                        </a>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] opacity-60 mt-1">
                    {new Date(message.timestamp).toLocaleTimeString(
                      currentLanguage === 'ar' ? 'ar-SA' : 'en-US',
                      { hour: '2-digit', minute: '2-digit' }
                    )}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Responses */}
          {config.enableSuggestions &&
            conversation.messages.length > 0 &&
            conversation.messages[conversation.messages.length - 1].role ===
              'assistant' && (
              <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                <div className="flex flex-wrap gap-2">
                  {conversation.messages[
                    conversation.messages.length - 1
                  ]?.sources?.slice(0, 2).map((source, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        handleSuggestedResponse(
                          currentLanguage === 'ar'
                            ? `شاهد ${source.title}`
                            : `View ${source.title}`
                        )
                      }
                      className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      {currentLanguage === 'ar' ? 'شاهد' : 'View'} {source.title}
                    </button>
                  ))}
                </div>
              </div>
            )}

          {/* Input */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentLanguage === 'ar'
                    ? 'اكتب رسالتك هنا...'
                    : 'Type your message here...'
                }
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 dark:text-gray-100"
                dir={currentLanguage === 'ar' ? 'rtl' : 'ltr'}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!inputText.trim()}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </div>
          </div>
        </m.div>
      )}
    </div>
  );
}
