/**
 * Wiki Chatbot Utilities
 * Core functions for AI-powered chatbot with RAG (Retrieval Augmented Generation)
 */

import type {
  ChatMessage,
  ChatSource,
  ChatConversation,
  ChatContext,
  WikiSearchResult,
  ChatIntent,
  ParsedQuery,
  QueryEntity,
  ChatbotConfig,
  ChatbotResponse,
  SuggestedResponse,
} from '../types/wiki-chatbot';
import type { WikiArticle, Tutorial, LearningPath, DifficultyLevel } from '../types';

// Default chatbot configuration
export const DEFAULT_CONFIG: ChatbotConfig = {
  maxMessages: 50,
  maxContextLength: 4000,
  maxSources: 5,
  similarityThreshold: 0.3,
  enableSuggestions: true,
  defaultLanguage: 'ar',
  availableLanguages: ['ar', 'en'],
};

/**
 * Detect language from text (Arabic or English)
 */
export function detectLanguage(text: string): 'ar' | 'en' {
  // Arabic Unicode range: \u0600-\u06FF
  const arabicChars = text.match(/[\u0600-\u06FF]/g);
  const totalChars = text.replace(/\s/g, '').length;

  if (totalChars === 0) return 'ar';

  const arabicRatio = arabicChars ? arabicChars.length / totalChars : 0;
  return arabicRatio > 0.3 ? 'ar' : 'en';
}

/**
 * Classify user query intent
 */
export function classifyIntent(text: string, language: 'ar' | 'en'): ChatIntent {
  const lowerText = text.toLowerCase();

  // Arabic patterns
  const arPatterns: Record<ChatIntent, RegExp[]> = {
    greeting: [/^(مرحبا|السلام|هلا|أهلا|يا هلا|مرحباً)/, /(كيف الحال|كيفك|اخبارك|عامل ايه)/],
    navigation: [
      /(اين|أين|ويف|موقع|مكان|طريق)/,
      /(كيف اصل|كيف اوصل|الطريق إلى|شارعني)/,
      /(ابحث عن|بحث عن|دلني على)/,
    ],
    explanation: [
      /(ما هو|ما هُو|وش يعني|وش معنى|اشرح|عرّف)/,
      /(فهمت|افهمني|وضح|بسّط)/,
      /(كيف يعمل|كيف اشتغل|مبدأ عمل)/,
    ],
    comparison: [
      /(الفرق بين|فرق|مقارنة|اي افضل|متميز)/,
      /(versus|vs|أمام|بدلاً من)/,
    ],
    recommendation: [
      /(ما افضل|ايهم افضل|نصحني|انصح لي)/,
      /(اقترح|اقتراح|بديل)/,
    ],
    troubleshooting: [
      /(مشكله|خلل|خطأ|error|bug|عطل|لا يعمل)/,
      /(حل|اصلاح|fix|debug|تغلب على)/,
    ],
    learning_path: [
      /(كيف اتعلم|طريقة تعلم|خطة تعلم)/,
      /(من اين ابدأ|اين البداية|الطريق الصحيح)/,
      /(خطوات|مراحل|مسار|path)/],
    general: [],
  };

  // English patterns
  const enPatterns: Record<ChatIntent, RegExp[]> = {
    greeting: [/^(hi|hello|hey|greetings)/, /(how are you|how's it going|what's up)/],
    navigation: [
      /(where|how to get|how to find|locate)/,
      /(search for|find|show me)/,
    ],
    explanation: [
      /(what is|explain|understand|clarify)/,
      /(how does|how do)/,
      /(meaning of|define)/],
    comparison: [
      /(difference|compare|versus|vs|better than)/,
      /(which is better|pros and cons)/,
    ],
    recommendation: [
      /(recommend|suggest|best)/,
      /(should i|advice|what should)/,
    ],
    troubleshooting: [
      /(problem|issue|error|bug|not working|broken)/,
      /(fix|solve|resolve|debug)/,
    ],
    learning_path: [
      /(how to learn|learning path|curriculum)/,
      /(where to start|beginner guide|step by step)/,
    ],
    general: [],
  };

  const patterns = language === 'ar' ? arPatterns : enPatterns;

  // Check each intent category
  for (const [intent, regexes] of Object.entries(patterns)) {
    if (intent === 'general') continue;
    for (const regex of regexes) {
      if (regex.test(lowerText)) {
        return intent as ChatIntent;
      }
    }
  }

  return 'general';
}

/**
 * Extract entities from user query
 */
export function extractEntities(
  text: string,
  language: 'ar' | 'en',
  wikiArticles: WikiArticle[],
  tutorials: Tutorial[],
  paths: LearningPath[]
): QueryEntity[] {
  const entities: QueryEntity[] = [];
  const lowerText = text.toLowerCase();

  // Extract tool names from wiki articles
  const toolSlugs = new Set(
    wikiArticles.map((a) => a.slug).concat(
      wikiArticles.filter((a) => a.section === 'أدوات').map((a) => a.title)
    )
  );

  // Extract section names
  const sections = new Set(wikiArticles.map((a) => a.section));

  // Extract difficulty levels
  const difficulties: DifficultyLevel[] = ['beginner', 'intermediate', 'advanced'];
  const arDifficultyLabels = ['مبتدئ', 'متوسط', 'متقدم'];

  // Extract topics and tags
  const topics = new Set([
    ...wikiArticles.flatMap((a) => a.tags || []),
    ...tutorials.flatMap((t) => t.tags || []),
  ]);

  // Check for tool mentions
  toolSlugs.forEach((tool) => {
    const index = lowerText.indexOf(tool.toLowerCase());
    if (index !== -1) {
      entities.push({
        type: 'tool',
        value: tool,
        confidence: 0.8,
      });
    }
  });

  // Check for section mentions
  sections.forEach((section) => {
    const index = lowerText.indexOf(section.toLowerCase());
    if (index !== -1) {
      entities.push({
        type: 'section',
        value: section,
        confidence: 0.7,
      });
    }
  });

  // Check for difficulty mentions
  if (language === 'ar') {
    arDifficultyLabels.forEach((label, i) => {
      if (lowerText.includes(label)) {
        entities.push({
          type: 'difficulty',
          value: difficulties[i],
          confidence: 0.9,
        });
      }
    });
  } else {
    difficulties.forEach((diff) => {
      if (lowerText.includes(diff)) {
        entities.push({
          type: 'difficulty',
          value: diff,
          confidence: 0.9,
        });
      }
    });
  }

  // Check for topic mentions
  topics.forEach((topic) => {
    if (topic && lowerText.includes(topic.toLowerCase())) {
      entities.push({
        type: 'topic',
        value: topic,
        confidence: 0.6,
      });
    }
  });

  // Sort by confidence and return top entities
  return entities.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
}

/**
 * Extract keywords from text for search
 */
export function extractKeywords(text: string, language: 'ar' | 'en'): string[] {
  // Remove common stop words
  const arStopWords = new Set([
    'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'ذلك', 'تلك',
    'ال', 'التي', 'الذي', 'الذين', 'لل', 'ل', 'كيف', 'ما', 'هل', 'اين'
  ]);

  const enStopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'in', 'on', 'at',
    'to', 'for', 'of', 'with', 'by', 'from', 'how', 'what', 'where', 'when'
  ]);

  const stopWords = language === 'ar' ? arStopWords : enStopWords;

  // Tokenize and filter
  const words = text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !stopWords.has(word));

  // Remove duplicates while preserving order
  return Array.from(new Set(words));
}

/**
 * Parse user query into structured format
 */
export function parseQuery(
  text: string,
  wikiArticles: WikiArticle[],
  tutorials: Tutorial[],
  paths: LearningPath[]
): ParsedQuery {
  const language = detectLanguage(text);
  const intent = classifyIntent(text, language);
  const entities = extractEntities(text, language, wikiArticles, tutorials, paths);
  const keywords = extractKeywords(text, language);

  return {
    originalText: text,
    intent,
    entities,
    keywords,
    language,
  };
}

/**
 * Search wiki content with fuzzy matching
 */
export function searchWikiContent(
  query: ParsedQuery,
  wikiArticles: WikiArticle[],
  tutorials: Tutorial[],
  paths: LearningPath[],
  maxResults: number = 5
): WikiSearchResult[] {
  const results: WikiSearchResult[] = [];
  const queryTerms = [
    ...query.keywords,
    ...query.entities.map((e) => e.value.toLowerCase()),
  ];

  // Search in articles
  wikiArticles.forEach((article) => {
    let score = 0;
    const matchedSections: string[] = [];

    // Check title match
    const titleLower = article.title.toLowerCase();
    queryTerms.forEach((term) => {
      if (titleLower.includes(term)) {
        score += 0.5;
        matchedSections.push('title');
      }
    });

    // Check section match
    const sectionLower = article.section.toLowerCase();
    queryTerms.forEach((term) => {
      if (sectionLower.includes(term)) {
        score += 0.3;
        matchedSections.push('section');
      }
    });

    // Check content match
    const contentLower = article.content.toLowerCase();
    queryTerms.forEach((term) => {
      const count = (contentLower.match(new RegExp(term, 'g')) || []).length;
      if (count > 0) {
        score += Math.min(count * 0.1, 0.5);
        matchedSections.push('content');
      }
    });

    if (score > 0) {
      results.push({
        article: {
          slug: article.slug,
          title: article.title,
          section: article.section,
          content: article.content,
        },
        score,
        matchedSections,
      });
    }
  });

  // Search in tutorials
  tutorials.forEach((tutorial) => {
    let score = 0;
    const matchedSections: string[] = [];

    const titleLower = tutorial.title.toLowerCase();
    queryTerms.forEach((term) => {
      if (titleLower.includes(term)) {
        score += 0.5;
        matchedSections.push('title');
      }
    });

    const descLower = tutorial.description.toLowerCase();
    queryTerms.forEach((term) => {
      if (descLower.includes(term)) {
        score += 0.3;
        matchedSections.push('description');
      }
    });

    if (score > 0) {
      results.push({
        article: {
          slug: tutorial.slug,
          title: tutorial.title,
          section: tutorial.section,
          content: tutorial.description,
        },
        score,
        matchedSections,
      });
    }
  });

  return results.sort((a, b) => b.score - a.score).slice(0, maxResults);
}

/**
 * Generate response using RAG
 */
export function generateResponse(
  query: ParsedQuery,
  searchResults: WikiSearchResult[],
  context: ChatContext,
  config: ChatbotConfig,
  language: 'ar' | 'en'
): ChatbotResponse {
  const sources: ChatSource[] = searchResults.slice(0, config.maxSources).map((result) => ({
    type: 'article',
    id: result.article.slug,
    slug: result.article.slug,
    title: result.article.title,
    excerpt: result.article.content.slice(0, 150) + '...',
    relevanceScore: result.score,
  }));

  let message = '';

  // Generate appropriate response based on intent
  if (query.intent === 'greeting') {
    message = language === 'ar'
      ? 'مرحباً بك في Vibe Wiki! كيف يمكنني مساعدتك اليوم في تعلم البرمجة بالذكاء الاصطناعي؟'
      : 'Welcome to Vibe Wiki! How can I help you today with AI-assisted programming?';
  } else if (searchResults.length === 0) {
    message = language === 'ar'
      ? 'عذراً، لم أجد معلومات محددة حول هذا الموضوع. هل يمكنك إعادة صياغة سؤالك أو البحث عن مصطلح مختلف؟'
      : 'Sorry, I couldn\'t find specific information about this topic. Could you rephrase your question or try a different search term?';
  } else {
    // Build contextual response
    const topResult = searchResults[0];
    if (query.intent === 'navigation') {
      message = language === 'ar'
        ? `وجدت معلومات ذات صلة: "${topResult.article.title}" في قسم ${topResult.article.section}.`
        : `I found relevant information: "${topResult.article.title}" in the ${topResult.article.section} section.`;
    } else if (query.intent === 'explanation') {
      message = language === 'ar'
        ? `بناءً على ما وجدته، "${topResult.article.title}" يحتوي على معلومات قد تفيدك.`
        : `Based on what I found, "${topResult.article.title}" contains information that might help you.`;
    } else if (query.intent === 'comparison') {
      const hasComparison = searchResults.length >= 2;
      if (hasComparison) {
        message = language === 'ar'
          ? `لمقارنة المفاهيم، راجع "${searchResults[0].article.title}" و"${searchResults[1].article.title}".`
          : `For comparison, see "${searchResults[0].article.title}" and "${searchResults[1].article.title}".`;
      } else {
        message = language === 'ar'
          ? `للمزيد من المعلومات، راجع "${topResult.article.title}".`
          : `For more information, see "${topResult.article.title}".`;
      }
    } else if (query.intent === 'recommendation') {
      const difficulty = query.entities.find((e) => e.type === 'difficulty');
      if (difficulty) {
        message = language === 'ar'
          ? `بناءً على مستواك (${difficulty.value})، أنصحك بـ "${topResult.article.title}".`
          : `Based on your level (${difficulty.value}), I recommend "${topResult.article.title}".`;
      } else {
        message = language === 'ar'
          ? `أنصحك بالبدء بـ "${topResult.article.title}".`
          : `I recommend starting with "${topResult.article.title}".`;
      }
    } else if (query.intent === 'troubleshooting') {
      message = language === 'ar'
        ? `لحل هذه المشكلة، راجع "${topResult.article.title}" للإرشادات.`
        : `To solve this issue, check "${topResult.article.title}" for guidance.`;
    } else if (query.intent === 'learning_path') {
      message = language === 'ar'
        ? `للتعلم التدريجي، ابدأ بـ "${topResult.article.title}" ثم تقدم للمواضيع المتقدمة.`
        : `For gradual learning, start with "${topResult.article.title}" then progress to advanced topics.`;
    } else {
      message = language === 'ar'
        ? `وجدت "${searchResults.length}" نتائج ذات صلة. أهمها: "${topResult.article.title}".`
        : `I found ${searchResults.length} relevant results. Most relevant: "${topResult.article.title}".`;
    }
  }

  // Generate suggested responses
  const suggestedResponses: SuggestedResponse[] = config.enableSuggestions
    ? generateSuggestedResponses(query, searchResults, language)
    : [];

  // Generate follow-up questions
  const followUpQuestions = language === 'ar'
    ? ['هل تحتاج مزيد من التفاصيل؟', 'هل تريد مثالاً عملياً؟', 'ما هو مستواك الحالي في البرمجة؟']
    : ['Do you need more details?', 'Would you like a practical example?', 'What is your current programming level?'];

  return {
    message,
    sources,
    suggestedResponses,
    followUpQuestions: followUpQuestions.slice(0, 2),
  };
}

/**
 * Generate suggested responses based on context
 */
export function generateSuggestedResponses(
  query: ParsedQuery,
  searchResults: WikiSearchResult[],
  language: 'ar' | 'en'
): SuggestedResponse[] {
  const responses: SuggestedResponse[] = [];

  if (searchResults.length > 0) {
    const topResult = searchResults[0];

    if (language === 'ar') {
      responses.push({
        text: `شاهد ${topResult.article.title}`,
        action: 'navigate',
        metadata: { slug: topResult.article.slug },
      });
      responses.push({
        text: `اشرح المزيد حول هذا`,
        action: 'explain',
        metadata: { slug: topResult.article.slug },
      });
    } else {
      responses.push({
        text: `View ${topResult.article.title}`,
        action: 'navigate',
        metadata: { slug: topResult.article.slug },
      });
      responses.push({
        text: `Explain more about this`,
        action: 'explain',
        metadata: { slug: topResult.article.slug },
      });
    }
  }

  if (query.intent === 'recommendation') {
    if (language === 'ar') {
      responses.push({
        text: 'أوصني بمسار تعلم',
        action: 'recommend',
        metadata: { type: 'path' },
      });
    } else {
      responses.push({
        text: 'Recommend a learning path',
        action: 'recommend',
        metadata: { type: 'path' },
      });
    }
  }

  return responses.slice(0, 3);
}

/**
 * Create new conversation
 */
export function createConversation(
  id: string,
  initialContext?: Partial<ChatContext>
): ChatConversation {
  return {
    id,
    messages: [],
    context: {
      interests: [],
      recentTopics: [],
      viewedArticles: [],
      completedTutorials: [],
      languagePreference: 'ar',
      ...initialContext,
    },
    startedAt: new Date(),
    lastActivity: new Date(),
  };
}

/**
 * Add message to conversation
 */
export function addMessage(
  conversation: ChatConversation,
  role: ChatMessage['role'],
  content: string,
  sources?: ChatSource[]
): ChatConversation {
  const message: ChatMessage = {
    id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    role,
    content,
    timestamp: new Date(),
    sources,
  };

  return {
    ...conversation,
    messages: [...conversation.messages, message],
    lastActivity: new Date(),
  };
}

/**
 * Update conversation context
 */
export function updateContext(
  conversation: ChatConversation,
  updates: Partial<ChatContext>
): ChatConversation {
  return {
    ...conversation,
    context: {
      ...conversation.context,
      ...updates,
    },
  };
}

/**
 * Trim conversation to max messages
 */
export function trimConversation(
  conversation: ChatConversation,
  maxMessages: number
): ChatConversation {
  if (conversation.messages.length <= maxMessages) {
    return conversation;
  }

  // Keep system messages and trim oldest user/assistant messages
  const systemMessages = conversation.messages.filter((m) => m.role === 'system');
  const otherMessages = conversation.messages.filter((m) => m.role !== 'system');
  const trimmed = otherMessages.slice(-maxMessages);

  return {
    ...conversation,
    messages: [...systemMessages, ...trimmed],
  };
}

/**
 * Extract topics from conversation
 */
export function extractTopics(conversation: ChatConversation): string[] {
  const topics: string[] = [];

  conversation.messages.forEach((message) => {
    if (message.sources) {
      message.sources.forEach((source) => {
        topics.push(source.title);
      });
    }
  });

  return Array.from(new Set(topics));
}

/**
 * Format conversation context for AI
 */
export function formatConversationContext(
  conversation: ChatConversation,
  maxLength: number
): string {
  let context = '';

  for (const message of conversation.messages) {
    const prefix = message.role === 'user' ? 'User: ' : 'Assistant: ';
    context += prefix + message.content + '\n';

    if (context.length > maxLength) {
      context = context.slice(-maxLength);
      break;
    }
  }

  return context;
}

/**
 * Calculate conversation summary stats
 */
export function getConversationStats(conversation: ChatConversation): {
  messageCount: number;
  userMessages: number;
  assistantMessages: number;
  duration: number;
} {
  const userMessages = conversation.messages.filter((m) => m.role === 'user').length;
  const assistantMessages = conversation.messages.filter((m) => m.role === 'assistant').length;
  const duration = conversation.lastActivity.getTime() - conversation.startedAt.getTime();

  return {
    messageCount: conversation.messages.length,
    userMessages,
    assistantMessages,
    duration,
  };
}
