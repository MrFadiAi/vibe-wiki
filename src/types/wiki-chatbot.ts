/**
 * Wiki Chatbot Types
 * AI-powered chatbot for navigating and understanding Vibe Wiki content
 */

// Message types for chatbot conversation
export type ChatMessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  timestamp: Date;
  sources?: ChatSource[];
}

// Source citations for RAG (Retrieval Augmented Generation)
export interface ChatSource {
  type: 'article' | 'tutorial' | 'path' | 'section';
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  relevanceScore: number;
}

// Suggested responses for quick user actions
export interface SuggestedResponse {
  text: string;
  action: 'navigate' | 'search' | 'explain' | 'compare' | 'recommend';
  metadata?: Record<string, unknown>;
}

// Chatbot conversation state
export interface ChatConversation {
  id: string;
  messages: ChatMessage[];
  context: ChatContext;
  startedAt: Date;
  lastActivity: Date;
}

// Context tracking for personalization
export interface ChatContext {
  userLevel?: 'beginner' | 'intermediate' | 'advanced';
  interests: string[];
  recentTopics: string[];
  viewedArticles: string[];
  completedTutorials: string[];
  languagePreference: 'ar' | 'en' | 'both';
}

// Search result for RAG
export interface WikiSearchResult {
  article: {
    slug: string;
    title: string;
    section: string;
    content: string;
  };
  score: number;
  matchedSections: string[];
}

// Intent classification for user queries
export type ChatIntent =
  | 'navigation'       // Finding specific content
  | 'explanation'      // Understanding concepts
  | 'comparison'       // Comparing tools/concepts
  | 'recommendation'   // Getting personalized suggestions
  | 'troubleshooting'  // Solving problems
  | 'learning_path'    // Finding learning paths
  | 'general'          // General questions
  | 'greeting';        // Hello/introduction

// Parsed user query with intent and entities
export interface ParsedQuery {
  originalText: string;
  intent: ChatIntent;
  entities: QueryEntity[];
  keywords: string[];
  language: 'ar' | 'en';
}

// Extracted entities from query
export interface QueryEntity {
  type: 'tool' | 'concept' | 'section' | 'difficulty' | 'topic' | 'feature';
  value: string;
  confidence: number;
}

// Chatbot configuration
export interface ChatbotConfig {
  maxMessages: number;
  maxContextLength: number;
  maxSources: number;
  similarityThreshold: number;
  enableSuggestions: boolean;
  defaultLanguage: 'ar' | 'en';
  availableLanguages: ('ar' | 'en')[];
}

// Chatbot response with suggestions
export interface ChatbotResponse {
  message: string;
  sources: ChatSource[];
  suggestedResponses: SuggestedResponse[];
  followUpQuestions: string[];
}

// Analytics for chatbot usage
export interface ChatbotAnalytics {
  totalConversations: number;
  totalMessages: number;
  averageMessagesPerConversation: number;
  intentDistribution: Record<ChatIntent, number>;
  topTopics: Array<{ topic: string; count: number }>;
  satisfiedUsers: number;
  escalatedToHuman: number;
}

// Feedback on chatbot responses
export interface ChatbotFeedback {
  conversationId: string;
  messageId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  helpful: boolean;
  issue?: 'inaccurate' | 'unclear' | 'missing_source' | 'irrelevant' | 'other';
  comment?: string;
  timestamp: Date;
}
