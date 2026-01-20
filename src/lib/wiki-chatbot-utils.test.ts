/**
 * Tests for Wiki Chatbot Utilities
 */

import {
  detectLanguage,
  classifyIntent,
  extractEntities,
  extractKeywords,
  parseQuery,
  searchWikiContent,
  generateResponse,
  createConversation,
  addMessage,
  updateContext,
  trimConversation,
  extractTopics,
  formatConversationContext,
  getConversationStats,
  generateSuggestedResponses,
  DEFAULT_CONFIG,
} from '../wiki-chatbot-utils';
import type { WikiArticle, Tutorial, LearningPath } from '../../types';

describe('Wiki Chatbot Utilities', () => {
  const mockWikiArticles: WikiArticle[] = [
    {
      slug: 'cursor-ide',
      title: 'Cursor IDE',
      section: 'أدوات',
      content: 'Cursor IDE is a powerful AI-powered code editor built on VS Code.',
      tags: ['ide', 'ai', 'editor'],
    },
    {
      slug: 'v0-dev',
      title: 'v0.dev',
      section: 'أدوات',
      content: 'v0.dev is a UI generation tool by Vercel that uses AI to create interfaces.',
      tags: ['ui', 'ai', 'vercel'],
    },
    {
      slug: 'vibecoding-intro',
      title: 'مقدمة في Vibecoding',
      section: 'مفاهيم',
      content: 'Vibecoding is the philosophy of using AI tools to enhance programming productivity.',
      tags: ['philosophy', 'productivity'],
    },
  ];

  const mockTutorials: Tutorial[] = [
    {
      id: 'tutorial-1',
      slug: 'cursor-basics',
      title: 'أساسيات Cursor',
      description: 'Learn the basics of Cursor IDE for AI-powered coding.',
      section: 'أدوات',
      difficulty: 'beginner',
      estimatedMinutes: 15,
      learningObjectives: ['Understand Cursor interface', 'Use AI chat feature'],
      steps: [],
      tags: ['cursor', 'beginner'],
    },
    {
      id: 'tutorial-2',
      slug: 'v0-advanced',
      title: 'v0 المتقدم',
      description: 'Advanced techniques for v0.dev UI generation.',
      section: 'أدوات',
      difficulty: 'advanced',
      estimatedMinutes: 30,
      learningObjectives: ['Master v0 prompts', 'Customize generated UIs'],
      steps: [],
      tags: ['v0', 'advanced'],
    },
  ];

  const mockPaths: LearningPath[] = [
    {
      id: 'path-1',
      slug: 'vibecoding-journey',
      title: 'رحلة Vibecoding',
      description: 'Complete journey from beginner to advanced AI-assisted programming.',
      difficulty: 'beginner',
      estimatedMinutes: 120,
      targetAudience: ['beginners'],
      learningObjectives: ['Master vibecoding tools', 'Build AI-assisted projects'],
      items: [],
    },
  ];

  describe('detectLanguage', () => {
    it('should detect Arabic text', () => {
      expect(detectLanguage('مرحبا كيف حالك')).toBe('ar');
      expect(detectLanguage('أين يمكنني العثور على')).toBe('ar');
    });

    it('should detect English text', () => {
      expect(detectLanguage('Hello how are you')).toBe('en');
      expect(detectLanguage('Where can I find')).toBe('en');
    });

    it('should default to Arabic for empty string', () => {
      expect(detectLanguage('')).toBe('ar');
    });

    it('should detect language with mixed content based on majority', () => {
      expect(detectLanguage('Hello مرحبا')).toBe('ar');
      expect(detectLanguage('مرحبا hello hello')).toBe('en');
    });
  });

  describe('classifyIntent', () => {
    it('should detect greeting intent in Arabic', () => {
      expect(classifyIntent('مرحبا', 'ar')).toBe('greeting');
      expect(classifyIntent('السلام عليكم', 'ar')).toBe('greeting');
      expect(classifyIntent('كيف الحال', 'ar')).toBe('greeting');
    });

    it('should detect greeting intent in English', () => {
      expect(classifyIntent('Hello', 'en')).toBe('greeting');
      expect(classifyIntent('Hi there', 'en')).toBe('greeting');
      expect(classifyIntent('How are you', 'en')).toBe('greeting');
    });

    it('should detect navigation intent', () => {
      expect(classifyIntent('أين Cursor IDE', 'ar')).toBe('navigation');
      expect(classifyIntent('Where is v0', 'en')).toBe('navigation');
      expect(classifyIntent('how to find cursor', 'en')).toBe('navigation');
    });

    it('should detect explanation intent', () => {
      expect(classifyIntent('ما هو Vibecoding', 'ar')).toBe('explanation');
      expect(classifyIntent('What is v0.dev', 'en')).toBe('explanation');
      expect(classifyIntent('اشرح لي Cursor', 'ar')).toBe('explanation');
    });

    it('should detect comparison intent', () => {
      expect(classifyIntent('الفرق بين Cursor و v0', 'ar')).toBe('comparison');
      expect(classifyIntent('Compare cursor and v0', 'en')).toBe('comparison');
      expect(classifyIntent('Cursor vs v0', 'en')).toBe('comparison');
    });

    it('should detect recommendation intent', () => {
      expect(classifyIntent('ما افضل أداة', 'ar')).toBe('recommendation');
      expect(classifyIntent('Which tool is best', 'en')).toBe('recommendation');
      expect(classifyIntent('نصحني بأداة', 'ar')).toBe('recommendation');
    });

    it('should detect troubleshooting intent', () => {
      expect(classifyIntent('مشكلة في Cursor', 'ar')).toBe('troubleshooting');
      expect(classifyIntent('Error in v0', 'en')).toBe('troubleshooting');
      expect(classifyIntent('كيف احل المشكلة', 'ar')).toBe('troubleshooting');
    });

    it('should detect learning path intent', () => {
      expect(classifyIntent('كيف اتعلم البرمجة', 'ar')).toBe('learning_path');
      expect(classifyIntent('How to learn AI coding', 'en')).toBe('learning_path');
      expect(classifyIntent('من اين ابدأ', 'ar')).toBe('learning_path');
    });

    it('should return general for unrecognized intents', () => {
      expect(classifyIntent('random text', 'en')).toBe('general');
      expect(classifyIntent('نص عشوائي', 'ar')).toBe('general');
    });
  });

  describe('extractEntities', () => {
    it('should extract tool entities', () => {
      const entities = extractEntities(
        'أريد معرفة عن Cursor IDE',
        'ar',
        mockWikiArticles,
        mockTutorials,
        mockPaths
      );
      expect(entities.some((e) => e.type === 'tool' && e.value === 'Cursor IDE')).toBe(true);
    });

    it('should extract section entities', () => {
      const entities = extractEntities(
        'What tools are available',
        'en',
        mockWikiArticles,
        mockTutorials,
        mockPaths
      );
      expect(entities.some((e) => e.type === 'section' && e.value === 'أدوات')).toBe(true);
    });

    it('should extract difficulty entities', () => {
      const entitiesAr = extractEntities(
        'دورة مبتدئ',
        'ar',
        mockWikiArticles,
        mockTutorials,
        mockPaths
      );
      expect(entitiesAr.some((e) => e.type === 'difficulty' && e.value === 'beginner')).toBe(true);

      const entitiesEn = extractEntities(
        'advanced tutorial',
        'en',
        mockWikiArticles,
        mockTutorials,
        mockPaths
      );
      expect(entitiesEn.some((e) => e.type === 'difficulty' && e.value === 'advanced')).toBe(true);
    });

    it('should extract topic entities', () => {
      const entities = extractEntities(
        'Tell me about AI tools',
        'en',
        mockWikiArticles,
        mockTutorials,
        mockPaths
      );
      expect(entities.some((e) => e.type === 'topic' && e.value === 'ai')).toBe(true);
    });

    it('should limit entities to top 5 by confidence', () => {
      const entities = extractEntities(
        'AI editor for beginners with UI tools',
        'en',
        mockWikiArticles,
        mockTutorials,
        mockPaths
      );
      expect(entities.length).toBeLessThanOrEqual(5);
    });
  });

  describe('extractKeywords', () => {
    it('should extract Arabic keywords', () => {
      const keywords = extractKeywords('أريد معرفة عن Cursor IDE', 'ar');
      expect(keywords).toContain('معرفة');
      expect(keywords).toContain('cursor');
    });

    it('should extract English keywords', () => {
      const keywords = extractKeywords('I want to know about Cursor IDE', 'en');
      expect(keywords).toContain('cursor');
      expect(keywords).toContain('ide');
    });

    it('should filter stop words', () => {
      const keywordsAr = extractKeywords('في المقال عن', 'ar');
      expect(keywordsAr).not.toContain('في');
      expect(keywordsAr).not.toContain('عن');

      const keywordsEn = extractKeywords('the article about', 'en');
      expect(keywordsEn).not.toContain('the');
      expect(keywordsEn).not.toContain('about');
    });

    it('should filter short words', () => {
      const keywords = extractKeywords('I am a dev', 'en');
      expect(keywords).not.toContain('I');
      expect(keywords).not.toContain('am');
    });

    it('should remove duplicates', () => {
      const keywords = extractKeywords('cursor cursor cursor', 'en');
      expect(keywords.filter((k) => k === 'cursor').length).toBe(1);
    });
  });

  describe('parseQuery', () => {
    it('should parse Arabic query correctly', () => {
      const parsed = parseQuery('ما هو Cursor IDE', mockWikiArticles, mockTutorials, mockPaths);

      expect(parsed.originalText).toBe('ما هو Cursor IDE');
      expect(parsed.language).toBe('ar');
      expect(parsed.intent).toBe('explanation');
      expect(parsed.keywords.length).toBeGreaterThan(0);
    });

    it('should parse English query correctly', () => {
      const parsed = parseQuery('What is v0.dev', mockWikiArticles, mockTutorials, mockPaths);

      expect(parsed.originalText).toBe('What is v0.dev');
      expect(parsed.language).toBe('en');
      expect(parsed.intent).toBe('explanation');
      expect(parsed.keywords.length).toBeGreaterThan(0);
    });

    it('should extract entities from query', () => {
      const parsed = parseQuery(' Cursor vs v0', mockWikiArticles, mockTutorials, mockPaths);

      expect(parsed.entities.length).toBeGreaterThan(0);
      expect(parsed.intent).toBe('comparison');
    });
  });

  describe('searchWikiContent', () => {
    it('should find matching articles by title', () => {
      const query: Parameters<typeof searchWikiContent>[0] = {
        originalText: 'Cursor',
        intent: 'navigation',
        entities: [],
        keywords: ['cursor'],
        language: 'en',
      };

      const results = searchWikiContent(query, mockWikiArticles, mockTutorials, mockPaths);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].article.title).toContain('Cursor');
    });

    it('should find matching articles by content', () => {
      const query: Parameters<typeof searchWikiContent>[0] = {
        originalText: 'AI editor',
        intent: 'explanation',
        entities: [],
        keywords: ['ai', 'editor'],
        language: 'en',
      };

      const results = searchWikiContent(query, mockWikiArticles, mockTutorials, mockPaths);

      expect(results.length).toBeGreaterThan(0);
    });

    it('should find matching tutorials', () => {
      const query: Parameters<typeof searchWikiContent>[0] = {
        originalText: 'advanced v0',
        intent: 'recommendation',
        entities: [],
        keywords: ['advanced', 'v0'],
        language: 'en',
      };

      const results = searchWikiContent(query, mockWikiArticles, mockTutorials, mockPaths);

      expect(results.some((r) => r.article.slug === 'v0-advanced')).toBe(true);
    });

    it('should limit results by maxResults parameter', () => {
      const query: Parameters<typeof searchWikiContent>[0] = {
        originalText: 'AI tool',
        intent: 'general',
        entities: [],
        keywords: ['ai', 'tool'],
        language: 'en',
      };

      const results = searchWikiContent(query, mockWikiArticles, mockTutorials, mockPaths, 2);

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should sort results by relevance score', () => {
      const query: Parameters<typeof searchWikiContent>[0] = {
        originalText: 'Cursor IDE tutorial',
        intent: 'navigation',
        entities: [],
        keywords: ['cursor', 'ide', 'tutorial'],
        language: 'en',
      };

      const results = searchWikiContent(query, mockWikiArticles, mockTutorials, mockPaths);

      expect(results[0].score).toBeGreaterThanOrEqual(results[1]?.score || 0);
    });
  });

  describe('generateResponse', () => {
    it('should generate greeting response', () => {
      const query: Parameters<typeof generateResponse>[0] = {
        originalText: 'مرحبا',
        intent: 'greeting',
        entities: [],
        keywords: [],
        language: 'ar',
      };

      const response = generateResponse(
        query,
        [],
        {
          interests: [],
          recentTopics: [],
          viewedArticles: [],
          completedTutorials: [],
          languagePreference: 'ar',
        },
        DEFAULT_CONFIG,
        'ar'
      );

      expect(response.message).toContain('مرحبا');
      expect(response.sources).toEqual([]);
    });

    it('should generate response with sources', () => {
      const query: Parameters<typeof generateResponse>[0] = {
        originalText: 'What is Cursor',
        intent: 'explanation',
        entities: [],
        keywords: ['cursor'],
        language: 'en',
      };

      const searchResults = [
        {
          article: {
            slug: 'cursor-ide',
            title: 'Cursor IDE',
            section: 'أدوات',
            content: 'Cursor IDE is a powerful AI-powered code editor.',
          },
          score: 0.8,
          matchedSections: ['title'],
        },
      ];

      const response = generateResponse(
        query,
        searchResults,
        {
          interests: [],
          recentTopics: [],
          viewedArticles: [],
          completedTutorials: [],
          languagePreference: 'en',
        },
        DEFAULT_CONFIG,
        'en'
      );

      expect(response.message).toBeTruthy();
      expect(response.sources).toHaveLength(1);
      expect(response.sources[0].title).toBe('Cursor IDE');
    });

    it('should generate suggested responses when enabled', () => {
      const query: Parameters<typeof generateResponse>[0] = {
        originalText: 'recommend a tool',
        intent: 'recommendation',
        entities: [],
        keywords: ['recommend', 'tool'],
        language: 'en',
      };

      const searchResults = [
        {
          article: {
            slug: 'cursor-ide',
            title: 'Cursor IDE',
            section: 'أدوات',
            content: 'Cursor IDE content',
          },
          score: 0.8,
          matchedSections: ['title'],
        },
      ];

      const config = { ...DEFAULT_CONFIG, enableSuggestions: true };

      const response = generateResponse(
        query,
        searchResults,
        {
          interests: [],
          recentTopics: [],
          viewedArticles: [],
          completedTutorials: [],
          languagePreference: 'en',
        },
        config,
        'en'
      );

      expect(response.suggestedResponses.length).toBeGreaterThan(0);
    });

    it('should generate no results response for empty search', () => {
      const query: Parameters<typeof generateResponse>[0] = {
        originalText: 'xyz nonexistent tool',
        intent: 'navigation',
        entities: [],
        keywords: ['xyz', 'nonexistent', 'tool'],
        language: 'en',
      };

      const response = generateResponse(
        query,
        [],
        {
          interests: [],
          recentTopics: [],
          viewedArticles: [],
          completedTutorials: [],
          languagePreference: 'en',
        },
        DEFAULT_CONFIG,
        'en'
      );

      expect(response.message).toContain('find');
      expect(response.sources).toEqual([]);
    });

    it('should limit sources to maxSources', () => {
      const query: Parameters<typeof generateResponse>[0] = {
        originalText: 'AI tools',
        intent: 'navigation',
        entities: [],
        keywords: ['ai', 'tools'],
        language: 'en',
      };

      const searchResults = Array.from({ length: 10 }, (_, i) => ({
        article: {
          slug: `tool-${i}`,
          title: `Tool ${i}`,
          section: 'أدوات',
          content: `Content for tool ${i}`,
        },
        score: 0.5,
        matchedSections: ['title'],
      }));

      const response = generateResponse(
        query,
        searchResults,
        {
          interests: [],
          recentTopics: [],
          viewedArticles: [],
          completedTutorials: [],
          languagePreference: 'en',
        },
        { ...DEFAULT_CONFIG, maxSources: 3 },
        'en'
      );

      expect(response.sources.length).toBeLessThanOrEqual(3);
    });
  });

  describe('generateSuggestedResponses', () => {
    it('should generate navigation suggestions', () => {
      const query: Parameters<typeof generateSuggestedResponses>[0] = {
        originalText: 'Tell me about Cursor',
        intent: 'explanation',
        entities: [],
        keywords: ['cursor'],
        language: 'en',
      };

      const searchResults = [
        {
          article: {
            slug: 'cursor-ide',
            title: 'Cursor IDE',
            section: 'أدوات',
            content: 'Content',
          },
          score: 0.8,
          matchedSections: ['title'],
        },
      ];

      const suggestions = generateSuggestedResponses(query, searchResults, 'en');

      expect(suggestions.some((s) => s.action === 'navigate')).toBe(true);
    });

    it('should generate explain suggestions', () => {
      const query: Parameters<typeof generateSuggestedResponses>[0] = {
        originalText: 'Tell me about Cursor',
        intent: 'explanation',
        entities: [],
        keywords: ['cursor'],
        language: 'en',
      };

      const searchResults = [
        {
          article: {
            slug: 'cursor-ide',
            title: 'Cursor IDE',
            section: 'أدوات',
            content: 'Content',
          },
          score: 0.8,
          matchedSections: ['title'],
        },
      ];

      const suggestions = generateSuggestedResponses(query, searchResults, 'en');

      expect(suggestions.some((s) => s.action === 'explain')).toBe(true);
    });

    it('should generate recommend suggestions for recommendation intent', () => {
      const query: Parameters<typeof generateSuggestedResponses>[0] = {
        originalText: 'recommend something',
        intent: 'recommendation',
        entities: [],
        keywords: ['recommend'],
        language: 'en',
      };

      const suggestions = generateSuggestedResponses(query, [], 'en');

      expect(suggestions.some((s) => s.action === 'recommend')).toBe(true);
    });

    it('should limit suggestions to 3', () => {
      const query: Parameters<typeof generateSuggestedResponses>[0] = {
        originalText: 'Tell me about Cursor',
        intent: 'explanation',
        entities: [],
        keywords: ['cursor'],
        language: 'en',
      };

      const searchResults = [
        {
          article: {
            slug: 'cursor-ide',
            title: 'Cursor IDE',
            section: 'أدوات',
            content: 'Content',
          },
          score: 0.8,
          matchedSections: ['title'],
        },
      ];

      const suggestions = generateSuggestedResponses(query, searchResults, 'en');

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('createConversation', () => {
    it('should create conversation with default context', () => {
      const conversation = createConversation('conv-1');

      expect(conversation.id).toBe('conv-1');
      expect(conversation.messages).toEqual([]);
      expect(conversation.context.interests).toEqual([]);
      expect(conversation.context.recentTopics).toEqual([]);
      expect(conversation.context.viewedArticles).toEqual([]);
      expect(conversation.context.completedTutorials).toEqual([]);
      expect(conversation.context.languagePreference).toBe('ar');
    });

    it('should create conversation with custom context', () => {
      const conversation = createConversation('conv-2', {
        languagePreference: 'en',
        userLevel: 'advanced',
        interests: ['AI', 'coding'],
      });

      expect(conversation.context.languagePreference).toBe('en');
      expect(conversation.context.userLevel).toBe('advanced');
      expect(conversation.context.interests).toEqual(['AI', 'coding']);
    });

    it('should set timestamps', () => {
      const now = new Date();
      const conversation = createConversation('conv-3');

      expect(conversation.startedAt.getTime()).toBeCloseTo(now.getTime(), -3);
      expect(conversation.lastActivity.getTime()).toBeCloseTo(now.getTime(), -3);
    });
  });

  describe('addMessage', () => {
    it('should add user message', () => {
      const conversation = createConversation('conv-1');
      const updated = addMessage(conversation, 'user', 'Hello');

      expect(updated.messages).toHaveLength(1);
      expect(updated.messages[0].role).toBe('user');
      expect(updated.messages[0].content).toBe('Hello');
      expect(updated.messages[0].id).toMatch(/^msg-/);
    });

    it('should add assistant message with sources', () => {
      const conversation = createConversation('conv-1');
      const sources = [
        {
          type: 'article' as const,
          id: 'cursor-ide',
          slug: 'cursor-ide',
          title: 'Cursor IDE',
          excerpt: 'Content excerpt',
          relevanceScore: 0.8,
        },
      ];
      const updated = addMessage(conversation, 'assistant', 'Check this', sources);

      expect(updated.messages).toHaveLength(1);
      expect(updated.messages[0].role).toBe('assistant');
      expect(updated.messages[0].sources).toEqual(sources);
    });

    it('should update lastActivity timestamp', () => {
      const conversation = createConversation('conv-1');
      // Simulate time passing
      const pastDate = new Date(Date.now() - 10000);
      conversation.lastActivity = pastDate;

      const updated = addMessage(conversation, 'user', 'test');

      expect(updated.lastActivity.getTime()).toBeGreaterThan(pastDate.getTime());
    });

    it('should generate unique message IDs', () => {
      const conversation = createConversation('conv-1');
      const updated1 = addMessage(conversation, 'user', 'first');
      const updated2 = addMessage(updated1, 'user', 'second');

      expect(updated2.messages[0].id).not.toBe(updated2.messages[1].id);
    });
  });

  describe('updateContext', () => {
    it('should update context fields', () => {
      const conversation = createConversation('conv-1');
      const updated = updateContext(conversation, {
        userLevel: 'intermediate',
        languagePreference: 'en',
      });

      expect(updated.context.userLevel).toBe('intermediate');
      expect(updated.context.languagePreference).toBe('en');
    });

    it('should preserve existing context fields', () => {
      const conversation = createConversation('conv-1', {
        interests: ['AI'],
        languagePreference: 'en',
      });
      const updated = updateContext(conversation, { userLevel: 'advanced' });

      expect(updated.context.interests).toEqual(['AI']);
      expect(updated.context.languagePreference).toBe('en');
      expect(updated.context.userLevel).toBe('advanced');
    });
  });

  describe('trimConversation', () => {
    it('should not trim if under limit', () => {
      const conversation = createConversation('conv-1');
      let updated = conversation;
      for (let i = 0; i < 5; i++) {
        updated = addMessage(updated, 'user', `message ${i}`);
      }

      const trimmed = trimConversation(updated, 10);
      expect(trimmed.messages).toHaveLength(5);
    });

    it('should trim to max messages', () => {
      const conversation = createConversation('conv-1');
      let updated = conversation;
      for (let i = 0; i < 20; i++) {
        updated = addMessage(updated, 'user', `message ${i}`);
      }

      const trimmed = trimConversation(updated, 10);
      expect(trimmed.messages).toHaveLength(10);
    });

    it('should preserve system messages', () => {
      const conversation = createConversation('conv-1');
      let updated = addMessage(conversation, 'system', 'System message');
      for (let i = 0; i < 20; i++) {
        updated = addMessage(updated, 'user', `message ${i}`);
      }

      const trimmed = trimConversation(updated, 5);

      expect(trimmed.messages[0].role).toBe('system');
      expect(trimmed.messages.length).toBe(6); // 1 system + 5 others
    });

    it('should keep most recent messages', () => {
      const conversation = createConversation('conv-1');
      let updated = conversation;
      for (let i = 0; i < 20; i++) {
        updated = addMessage(updated, 'user', `message ${i}`);
      }

      const trimmed = trimConversation(updated, 5);

      expect(trimmed.messages[0].content).toBe('message 15');
      expect(trimmed.messages[4].content).toBe('message 19');
    });
  });

  describe('extractTopics', () => {
    it('should extract topics from message sources', () => {
      const conversation = createConversation('conv-1');
      const sources = [
        {
          type: 'article' as const,
          id: 'cursor-ide',
          slug: 'cursor-ide',
          title: 'Cursor IDE',
          excerpt: 'Excerpt',
          relevanceScore: 0.8,
        },
        {
          type: 'article' as const,
          id: 'v0-dev',
          slug: 'v0-dev',
          title: 'v0.dev',
          excerpt: 'Excerpt',
          relevanceScore: 0.7,
        },
      ];

      let updated = addMessage(conversation, 'assistant', 'Response', sources);
      const topics = extractTopics(updated);

      expect(topics).toContain('Cursor IDE');
      expect(topics).toContain('v0.dev');
    });

    it('should remove duplicate topics', () => {
      const conversation = createConversation('conv-1');
      const sources = [
        {
          type: 'article' as const,
          id: 'cursor-ide',
          slug: 'cursor-ide',
          title: 'Cursor IDE',
          excerpt: 'Excerpt',
          relevanceScore: 0.8,
        },
      ];

      let updated = addMessage(conversation, 'assistant', 'Response 1', sources);
      updated = addMessage(updated, 'assistant', 'Response 2', sources);

      const topics = extractTopics(updated);

      expect(topics.filter((t) => t === 'Cursor IDE').length).toBe(1);
    });
  });

  describe('formatConversationContext', () => {
    it('should format conversation for AI', () => {
      const conversation = createConversation('conv-1');
      let updated = addMessage(conversation, 'user', 'Hello');
      updated = addMessage(updated, 'assistant', 'Hi there!');

      const formatted = formatConversationContext(updated, 1000);

      expect(formatted).toContain('User: Hello');
      expect(formatted).toContain('Assistant: Hi there!');
    });

    it('should trim context if exceeds maxLength', () => {
      const conversation = createConversation('conv-1');
      let updated = conversation;
      for (let i = 0; i < 10; i++) {
        updated = addMessage(updated, 'user', `Long message ${i} with lots of content`);
      }

      const formatted = formatConversationContext(updated, 100);

      expect(formatted.length).toBeLessThanOrEqual(100);
    });
  });

  describe('getConversationStats', () => {
    it('should calculate conversation statistics', () => {
      const conversation = createConversation('conv-1');
      let updated = addMessage(conversation, 'user', 'Hello');
      updated = addMessage(updated, 'assistant', 'Hi');
      updated = addMessage(updated, 'user', 'How are you?');

      const stats = getConversationStats(updated);

      expect(stats.messageCount).toBe(3);
      expect(stats.userMessages).toBe(2);
      expect(stats.assistantMessages).toBe(1);
      expect(stats.duration).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty conversation', () => {
      const conversation = createConversation('conv-1');
      const stats = getConversationStats(conversation);

      expect(stats.messageCount).toBe(0);
      expect(stats.userMessages).toBe(0);
      expect(stats.assistantMessages).toBe(0);
    });
  });

  describe('DEFAULT_CONFIG', () => {
    it('should have expected default values', () => {
      expect(DEFAULT_CONFIG.maxMessages).toBe(50);
      expect(DEFAULT_CONFIG.maxContextLength).toBe(4000);
      expect(DEFAULT_CONFIG.maxSources).toBe(5);
      expect(DEFAULT_CONFIG.similarityThreshold).toBe(0.3);
      expect(DEFAULT_CONFIG.enableSuggestions).toBe(true);
      expect(DEFAULT_CONFIG.defaultLanguage).toBe('ar');
      expect(DEFAULT_CONFIG.availableLanguages).toEqual(['ar', 'en']);
    });
  });
});
