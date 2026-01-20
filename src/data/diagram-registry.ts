/**
 * Diagram Registry for Vibe Wiki
 * Centralized metadata registry for all SVG diagrams with Arabic localization
 * Based on PRD Section 4.4: Diagram Registry
 */

export type DiagramCategory =
  | 'claude-cli'
  | 'copilot-cli'
  | 'opencode'
  | 'comparison'
  | 'workflow'
  | 'getting-started'
  | 'cli-overview';

export type DiagramPriority = 1 | 2 | 3; // P1 = High, P2 = Medium, P3 = Low

export interface DiagramEntry {
  filename: string;
  category: DiagramCategory;
  titleAr: string;
  altAr: string;
  captionAr: string;
  titleEn?: string;
  altEn?: string;
  captionEn?: string;
  relatedArticles: string[];
  priority: DiagramPriority;
}

/**
 * Priority loading for above-the-fold diagrams
 * These diagrams should have `priority={true}` when rendering
 */
export const PRIORITY_DIAGRAMS = new Set<string>([
  'getting-started-timeline-flow.svg',
  'getting-started-decision-tree.svg',
  'cli-overview-comparison-matrix.svg',
]);

/**
 * Complete diagram registry with all 55 SVGs from PRD
 * Each entry includes Arabic metadata for accessibility and localization
 */
export const diagramRegistry: DiagramEntry[] = [
  // ===== GETTING STARTED (5 SVGs) =====
  {
    filename: 'getting-started-timeline-flow.svg',
    category: 'getting-started',
    titleAr: 'الجدول الزمني للبدء',
    altAr: 'رسم بياني يوضح الجدول الزمني لرحلة الـ 15 دقيقة للبدء في البرمجة بالإحساس',
    captionAr: 'الشكل ١: الجدول الزمني لرحلتك الأولى في البرمجة بالإحساس',
    titleEn: 'Getting Started Timeline',
    altEn: 'Timeline diagram showing the 15-minute journey to start vibe coding',
    captionEn: 'Figure 1: Timeline of your first vibe coding journey',
    relatedArticles: ['what-is-vibe-coding', 'your-first-15-minutes'],
    priority: 1,
  },
  {
    filename: 'getting-started-decision-tree.svg',
    category: 'getting-started',
    titleAr: 'شجرة قرار اختيار الأداة',
    altAr: 'رسم بياني لشجرة القرار لاختيار أداة البرمجة بالذكاء الاصطناعي المناسبة',
    captionAr: 'الشكل ٢: شجرة قرار لاختيار أداة البرمجة بالذكاء الاصطناعي',
    titleEn: 'Tool Selection Decision Tree',
    altEn: 'Decision tree diagram for choosing the right AI coding tool',
    captionEn: 'Figure 2: Decision tree for selecting an AI coding tool',
    relatedArticles: ['what-is-vibe-coding', 'the-vibe-stack'],
    priority: 1,
  },
  {
    filename: 'getting-started-installation-flow.svg',
    category: 'getting-started',
    titleAr: 'خطوات تثبيت البيئة',
    altAr: 'رسم بياني يوضح خطوات تثبيت بيئة التطوير للبرمجة بالإحساس',
    captionAr: 'الشكل ٣: تدفق تثبيت الأدوات الأساسية',
    titleEn: 'Environment Installation Flow',
    altEn: 'Flow diagram showing development environment installation steps',
    captionEn: 'Figure 3: Installation flow for essential tools',
    relatedArticles: ['prep-your-machine'],
    priority: 1,
  },
  {
    filename: 'getting-started-ai-workflow.svg',
    category: 'getting-started',
    titleAr: 'سير عمل الذكاء الاصطناعي',
    altAr: 'رسم بياني يوضح سير عمل البرمجة بمساعدة الذكاء الاصطناعي',
    captionAr: 'الشكل ٤: دورة سير العمل من الفكرة إلى الكود',
    titleEn: 'AI Coding Workflow',
    altEn: 'Diagram showing AI-assisted coding workflow',
    captionEn: 'Figure 4: Workflow cycle from idea to code',
    relatedArticles: ['hello-world-with-ai'],
    priority: 1,
  },
  {
    filename: 'getting-started-learning-paths.svg',
    category: 'getting-started',
    titleAr: 'مسارات التعلم',
    altAr: 'رسم بياني يوضح مسارات التعلم المتاحة للبرمجة بالإحساس',
    captionAr: 'الشكل ٥: مسارات التعلم المتاحة',
    titleEn: 'Learning Paths',
    altEn: 'Diagram showing available learning paths',
    captionEn: 'Figure 5: Available learning paths',
    relatedArticles: ['what-is-vibe-coding'],
    priority: 1,
  },

  // ===== CLI OVERVIEW (3 SVGs) =====
  {
    filename: 'cli-overview-architecture.svg',
    category: 'cli-overview',
    titleAr: 'البنية العامة لأدوات CLI',
    altAr: 'رسم بياني يوضح البنية التقنية العامة لأدوات سطر الأوامر للذكاء الاصطناعي',
    captionAr: 'الشكل ٦: البنية التقنية لأدوات CLI للذكاء الاصطناعي',
    titleEn: 'CLI Tools Architecture',
    altEn: 'Technical architecture diagram of AI coding CLI tools',
    captionEn: 'Figure 6: Technical architecture of AI CLI tools',
    relatedArticles: ['cli-ecosystem-overview'],
    priority: 1,
  },
  {
    filename: 'cli-overview-ecosystem-landscape.svg',
    category: 'cli-overview',
    titleAr: 'منظومة أدوات CLI للذكاء الاصطناعي',
    altAr: 'رسم بياني يوضح منظومة أدوات سطر الأوامر للبرمجة بالذكاء الاصطناعي',
    captionAr: 'الشكل ٧: منظومة أدوات CLI للذكاء الاصطناعي',
    titleEn: 'CLI Ecosystem Landscape',
    altEn: 'Landscape diagram of AI coding CLI ecosystem',
    captionEn: 'Figure 7: AI CLI tool ecosystem landscape',
    relatedArticles: ['cli-ecosystem-overview'],
    priority: 1,
  },
  {
    filename: 'cli-overview-comparison-matrix.svg',
    category: 'cli-overview',
    titleAr: 'مصفوفة مقارنة أدوات CLI',
    altAr: 'رسم بياني يوضح مقارنة شاملة بين أدوات سطر الأوامر للذكاء الاصطناعي',
    captionAr: 'الشكل ٨: مصفوفة مقارنة أدوات CLI الرئيسية',
    titleEn: 'CLI Tools Comparison Matrix',
    altEn: 'Comprehensive comparison matrix of AI CLI tools',
    captionEn: 'Figure 8: Comparison matrix of major CLI tools',
    relatedArticles: ['cli-tools-comparison'],
    priority: 1,
  },

  // ===== CLAUDE CLI (9 SVGs) =====
  {
    filename: 'cli-claude-architecture.svg',
    category: 'claude-cli',
    titleAr: 'البنية التقنية لـ Claude CLI',
    altAr: 'رسم بياني يوضح البنية التقنية لـ Claude CLI وتفاعل المكونات',
    captionAr: 'الشكل ٩: البنية التقنية لـ Claude CLI',
    titleEn: 'Claude CLI Architecture',
    altEn: 'Technical architecture diagram of Claude CLI',
    captionEn: 'Figure 9: Claude CLI technical architecture',
    relatedArticles: ['claude-cli-comprehensive-guide', 'claude-cli-overview'],
    priority: 1,
  },
  {
    filename: 'cli-claude-features-grid.svg',
    category: 'claude-cli',
    titleAr: 'ميزات Claude CLI',
    altAr: 'رسم بياني يوضح الميزات الرئيسية لـ Claude CLI',
    captionAr: 'الشكل ١٠: شبكة ميزات Claude CLI',
    titleEn: 'Claude CLI Features',
    altEn: 'Grid diagram showing Claude CLI key features',
    captionEn: 'Figure 10: Claude CLI features grid',
    relatedArticles: ['claude-cli-comprehensive-guide', 'claude-cli-features'],
    priority: 2,
  },
  {
    filename: 'cli-claude-use-cases.svg',
    category: 'claude-cli',
    titleAr: 'حالات استخدام Claude CLI',
    altAr: 'رسم بياني يوضح حالات الاستخدام الرئيسية لـ Claude CLI',
    captionAr: 'الشكل ١١: حالات استخدام Claude CLI',
    titleEn: 'Claude CLI Use Cases',
    altEn: 'Diagram showing Claude CLI use cases',
    captionEn: 'Figure 11: Claude CLI use cases',
    relatedArticles: ['claude-cli-comprehensive-guide', 'claude-cli-overview'],
    priority: 1,
  },
  {
    filename: 'cli-claude-best-practices.svg',
    category: 'claude-cli',
    titleAr: 'أفضل الممارسات لاستخدام Claude CLI',
    altAr: 'رسم بياني يوضح أفضل الممارسات والأخطاء الشائعة لـ Claude CLI',
    captionAr: 'الشكل ١٢: دليل أفضل الممارسات لـ Claude CLI',
    titleEn: 'Claude CLI Best Practices',
    altEn: 'Best practices guide for Claude CLI',
    captionEn: 'Figure 12: Claude CLI best practices guide',
    relatedArticles: ['claude-cli-comprehensive-guide', 'claude-cli-best-practices'],
    priority: 2,
  },
  {
    filename: 'cli-claude-pricing-tiers.svg',
    category: 'claude-cli',
    titleAr: 'مستويات تسعير Claude CLI',
    altAr: 'رسم بياني يوضح مستويات التسعير المختلفة لـ Claude CLI',
    captionAr: 'الشكل ١٣: مستويات تسعير Claude CLI',
    titleEn: 'Claude CLI Pricing Tiers',
    altEn: 'Pricing tiers diagram for Claude CLI',
    captionEn: 'Figure 13: Claude CLI pricing tiers',
    relatedArticles: ['claude-cli-comprehensive-guide', 'claude-cli-pricing'],
    priority: 2,
  },
  {
    filename: 'cli-claude-command-flow.svg',
    category: 'claude-cli',
    titleAr: 'تدفق أوامر Claude CLI',
    altAr: 'رسم بياني يوضح تدفق الأوامر الشائعة في Claude CLI',
    captionAr: 'الشكل ١٤: تدفق أوامر Claude CLI',
    titleEn: 'Claude CLI Command Flow',
    altEn: 'Command flow diagram for Claude CLI',
    captionEn: 'Figure 14: Claude CLI command flow',
    relatedArticles: ['claude-cli-comprehensive-guide', 'claude-cli-commands'],
    priority: 1,
  },
  {
    filename: 'cli-claude-terminal-flow.svg',
    category: 'claude-cli',
    titleAr: 'تدفق الطرفية مع Claude CLI',
    altAr: 'رسم بياني يوضح تدفق العمل في الطرفية مع Claude CLI',
    captionAr: 'الشكل ١٥: تدفق الطرفية مع Claude CLI',
    titleEn: 'Claude CLI Terminal Flow',
    altEn: 'Terminal workflow diagram with Claude CLI',
    captionEn: 'Figure 15: Claude CLI terminal workflow',
    relatedArticles: ['claude-cli-comprehensive-guide', 'the-terminal'],
    priority: 1,
  },
  {
    filename: 'cli-claude-installation-checklist.svg',
    category: 'claude-cli',
    titleAr: 'قائمة تثبيت Claude CLI',
    altAr: 'رسم بياني يوضح خطوات تثبيت Claude CLI والتحقق منها',
    captionAr: 'الشكل ١٦: قائمة تثبيت والتحقق من Claude CLI',
    titleEn: 'Claude CLI Installation Checklist',
    altEn: 'Installation checklist diagram for Claude CLI',
    captionEn: 'Figure 16: Claude CLI installation checklist',
    relatedArticles: ['claude-cli-comprehensive-guide', 'prep-your-machine'],
    priority: 1,
  },
  {
    filename: 'cli-claude-comparison.svg',
    category: 'claude-cli',
    titleAr: 'مقارنة Claude CLI مع الأدوات الأخرى',
    altAr: 'رسم بياني يقارن Claude CLI مع أدوات سطر الأوامر الأخرى',
    captionAr: 'الشكل ١٧: مقارنة Claude CLI',
    titleEn: 'Claude CLI Comparison',
    altEn: 'Comparison diagram of Claude CLI with other tools',
    captionEn: 'Figure 17: Claude CLI comparison',
    relatedArticles: ['claude-cli-overview', 'cli-tools-comparison'],
    priority: 1,
  },

  // ===== COPILOT CLI (6 SVGs) =====
  {
    filename: 'cli-copilot-architecture.svg',
    category: 'copilot-cli',
    titleAr: 'بنية GitHub Copilot CLI',
    altAr: 'رسم بياني يوضح البنية التقنية لـ GitHub Copilot CLI',
    captionAr: 'الشكل ١٨: البنية التقنية لـ GitHub Copilot CLI',
    titleEn: 'GitHub Copilot CLI Architecture',
    altEn: 'Technical architecture diagram of GitHub Copilot CLI',
    captionEn: 'Figure 18: GitHub Copilot CLI architecture',
    relatedArticles: ['copilot-cli-comprehensive-guide'],
    priority: 1,
  },
  {
    filename: 'cli-copilot-features-grid.svg',
    category: 'copilot-cli',
    titleAr: 'ميزات GitHub Copilot CLI',
    altAr: 'رسم بياني يوضح الميزات الرئيسية لـ GitHub Copilot CLI',
    captionAr: 'الشكل ١٩: شبكة ميزات GitHub Copilot CLI',
    titleEn: 'GitHub Copilot CLI Features',
    altEn: 'Grid diagram showing GitHub Copilot CLI features',
    captionEn: 'Figure 19: GitHub Copilot CLI features grid',
    relatedArticles: ['copilot-cli-comprehensive-guide'],
    priority: 2,
  },
  {
    filename: 'cli-copilot-use-cases.svg',
    category: 'copilot-cli',
    titleAr: 'حالات استخدام Copilot CLI',
    altAr: 'رسم بياني يوضح حالات استخدام GitHub Copilot CLI',
    captionAr: 'الشكل ٢٠: حالات استخدام GitHub Copilot CLI',
    titleEn: 'GitHub Copilot CLI Use Cases',
    altEn: 'Use cases diagram for GitHub Copilot CLI',
    captionEn: 'Figure 20: GitHub Copilot CLI use cases',
    relatedArticles: ['copilot-cli-comprehensive-guide'],
    priority: 1,
  },
  {
    filename: 'cli-copilot-pricing-tiers.svg',
    category: 'copilot-cli',
    titleAr: 'تسعير GitHub Copilot CLI',
    altAr: 'رسم بياني يوضح مستويات تسعير GitHub Copilot CLI',
    captionAr: 'الشكل ٢١: مستويات تسعير GitHub Copilot CLI',
    titleEn: 'GitHub Copilot CLI Pricing',
    altEn: 'Pricing diagram for GitHub Copilot CLI',
    captionEn: 'Figure 21: GitHub Copilot CLI pricing tiers',
    relatedArticles: ['copilot-cli-comprehensive-guide', 'copilot-cli-pricing'],
    priority: 2,
  },
  {
    filename: 'cli-copilot-command-tree.svg',
    category: 'copilot-cli',
    titleAr: 'شجرة أوامر Copilot CLI',
    altAr: 'رسم بياني يوضح شجرة أوامر GitHub Copilot CLI',
    captionAr: 'الشكل ٢٢: شجرة أوامر GitHub Copilot CLI',
    titleEn: 'GitHub Copilot CLI Command Tree',
    altEn: 'Command tree diagram for GitHub Copilot CLI',
    captionEn: 'Figure 22: GitHub Copilot CLI command tree',
    relatedArticles: ['copilot-cli-comprehensive-guide', 'copilot-cli-commands'],
    priority: 1,
  },
  {
    filename: 'cli-copilot-installation.svg',
    category: 'copilot-cli',
    titleAr: 'خطوات تثبيت Copilot CLI',
    altAr: 'رسم بياني يوضح خطوات تثبيت GitHub Copilot CLI',
    captionAr: 'الشكل ٢٣: خطوات تثبيت GitHub Copilot CLI',
    titleEn: 'GitHub Copilot CLI Installation',
    altEn: 'Installation flow diagram for GitHub Copilot CLI',
    captionEn: 'Figure 23: GitHub Copilot CLI installation steps',
    relatedArticles: ['copilot-cli-comprehensive-guide', 'prep-your-machine'],
    priority: 1,
  },

  // ===== OPENCODE CLI (14 SVGs) =====
  {
    filename: 'cli-opencode-architecture.svg',
    category: 'opencode',
    titleAr: 'البنية التقنية لـ OpenCode',
    altAr: 'رسم بياني يوضح البنية التقنية لـ OpenCode ونظام الوكلاء المتعددين',
    captionAr: 'الشكل ٢٤: البنية التقنية لـ OpenCode',
    titleEn: 'OpenCode Architecture',
    altEn: 'Technical architecture diagram of OpenCode',
    captionEn: 'Figure 24: OpenCode technical architecture',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 1,
  },
  {
    filename: 'cli-opencode-features-grid.svg',
    category: 'opencode',
    titleAr: 'ميزات OpenCode',
    altAr: 'رسم بياني يوضح الميزات الرئيسية لـ OpenCode',
    captionAr: 'الشكل ٢٥: شبكة ميزات OpenCode',
    titleEn: 'OpenCode Features',
    altEn: 'Grid diagram showing OpenCode features',
    captionEn: 'Figure 25: OpenCode features grid',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 2,
  },
  {
    filename: 'cli-opencentode-installation-flow.svg',
    category: 'opencode',
    titleAr: 'تثبيت OpenCode',
    altAr: 'رسم بياني يوضح طرق تثبيت OpenCode',
    captionAr: 'الشكل ٢٦: تدفق تثبيت OpenCode',
    titleEn: 'OpenCode Installation',
    altEn: 'Installation flow diagram for OpenCode',
    captionEn: 'Figure 26: OpenCode installation flow',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 2,
  },
  {
    filename: 'cli-opencentode-initial-setup.svg',
    category: 'opencode',
    titleAr: 'الإعداد الأولي لـ OpenCode',
    altAr: 'رسم بياني يوضح خطوات الإعداد الأولي لـ OpenCode',
    captionAr: 'الشكل ٢٧: إعداد OpenCode الأولي',
    titleEn: 'OpenCode Initial Setup',
    altEn: 'Initial setup wizard diagram for OpenCode',
    captionEn: 'Figure 27: OpenCode initial setup',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 2,
  },
  {
    filename: 'cli-opencentode-basic-commands.svg',
    category: 'opencode',
    titleAr: 'أوامر OpenCode الأساسية',
    altAr: 'رسم بياني يوضح الأوامر الأساسية في OpenCode',
    captionAr: 'الشكل ٢٨: الأوامر الأساسية لـ OpenCode',
    titleEn: 'OpenCode Basic Commands',
    altEn: 'Basic commands diagram for OpenCode',
    captionEn: 'Figure 28: OpenCode basic commands',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 1,
  },
  {
    filename: 'cli-opencentode-multifile-workflow.svg',
    category: 'opencode',
    titleAr: 'سير عمل الملفات المتعددة',
    altAr: 'رسم بياني يوضح سير عمل OpenCode مع الملفات المتعددة',
    captionAr: 'الشكل ٢٩: سير عمل الملفات المتعددة في OpenCode',
    titleEn: 'Multi-File Workflow',
    altEn: 'Multi-file workflow diagram for OpenCode',
    captionEn: 'Figure 29: OpenCode multi-file workflow',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 1,
  },
  {
    filename: 'cli-opencentode-local-vs-cloud.svg',
    category: 'opencode',
    titleAr: 'المحلي مقابل السحابي في OpenCode',
    altAr: 'رسم بياني يقارن بين التنفيذ المحلي والسحابي في OpenCode',
    captionAr: 'الشكل ٣٠: المحلي مقابل السحابي في OpenCode',
    titleEn: 'Local vs Cloud Execution',
    altEn: 'Local vs cloud comparison diagram for OpenCode',
    captionEn: 'Figure 30: OpenCode local vs cloud execution',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 2,
  },
  {
    filename: 'cli-opencentode-comparison-matrix.svg',
    category: 'opencode',
    titleAr: 'مصفوفة مقارنة OpenCode',
    altAr: 'رسم بياني يقارن OpenCode مع أدوات CLI الأخرى',
    captionAr: 'الشكل ٣١: مقارنة OpenCode مع أدوات CLI الأخرى',
    titleEn: 'OpenCode Comparison Matrix',
    altEn: 'Comparison matrix of OpenCode with other CLI tools',
    captionEn: 'Figure 31: OpenCode comparison matrix',
    relatedArticles: ['opencode-comprehensive-guide', 'cli-tools-comparison'],
    priority: 1,
  },
  {
    filename: 'cli-opencentode-use-cases.svg',
    category: 'opencode',
    titleAr: 'حالات استخدام OpenCode',
    altAr: 'رسم بياني يوضح حالات استخدام OpenCode',
    captionAr: 'الشكل ٣٢: حالات استخدام OpenCode',
    titleEn: 'OpenCode Use Cases',
    altEn: 'Use cases diagram for OpenCode',
    captionEn: 'Figure 32: OpenCode use cases',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 1,
  },
  {
    filename: 'cli-opencentode-license-tiers.svg',
    category: 'opencode',
    titleAr: 'مستويات ترخيص OpenCode',
    altAr: 'رسم بياني يوضح مستويات الترخيص المختلفة لـ OpenCode',
    captionAr: 'الشكل ٣٣: مستويات ترخيص OpenCode',
    titleEn: 'OpenCode License Tiers',
    altEn: 'License tiers diagram for OpenCode',
    captionEn: 'Figure 33: OpenCode license tiers',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 2,
  },
  {
    filename: 'cli-opencentode-advanced-features.svg',
    category: 'opencode',
    titleAr: 'الميزات المتقدمة في OpenCode',
    altAr: 'رسم بياني يوضح الميزات المتقدمة في OpenCode',
    captionAr: 'الشكل ٣٤: الميزات المتقدمة في OpenCode',
    titleEn: 'OpenCode Advanced Features',
    altEn: 'Advanced features diagram for OpenCode',
    captionEn: 'Figure 34: OpenCode advanced features',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 2,
  },
  {
    filename: 'cli-opencode-editor-integration.svg',
    category: 'opencode',
    titleAr: 'تكامل OpenCode مع المحررات',
    altAr: 'رسم بياني يوضح تكامل OpenCode مع محررات الأكواد',
    captionAr: 'الشكل ٣٥: تكامل OpenCode مع المحررات',
    titleEn: 'OpenCode Editor Integration',
    altEn: 'Editor integration diagram for OpenCode',
    captionEn: 'Figure 35: OpenCode editor integration',
    relatedArticles: ['opencode-comprehensive-guide', 'the-editor'],
    priority: 1,
  },
  {
    filename: 'cli-opencode-context-sources.svg',
    category: 'opencode',
    titleAr: 'مصادر السياق في OpenCode',
    altAr: 'رسم بياني يوضح مصادر السياق التي يستخدمها OpenCode',
    captionAr: 'الشكل ٣٦: مصادر السياق في OpenCode',
    titleEn: 'OpenCode Context Sources',
    altEn: 'Context sources diagram for OpenCode',
    captionEn: 'Figure 36: OpenCode context sources',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 1,
  },
  {
    filename: 'cli-opencode-workflow-state.svg',
    category: 'opencode',
    titleAr: 'حالات سير العمل في OpenCode',
    altAr: 'رسم بياني يوضح حالات سير العمل المختلفة في OpenCode',
    captionAr: 'الشكل ٣٧: حالات سير العمل في OpenCode',
    titleEn: 'OpenCode Workflow States',
    altEn: 'Workflow states diagram for OpenCode',
    captionEn: 'Figure 37: OpenCode workflow states',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 2,
  },
  {
    filename: 'cli-opencode-agent-collaboration.svg',
    category: 'opencode',
    titleAr: 'تعاون الوكلاء في OpenCode',
    altAr: 'رسم بياني يوضح كيفية تعاون الوكلاء المتعددين في OpenCode',
    captionAr: 'الشكل ٣٨: تعاون الوكلاء في OpenCode',
    titleEn: 'OpenCode Agent Collaboration',
    altEn: 'Agent collaboration diagram for OpenCode',
    captionEn: 'Figure 38: OpenCode agent collaboration',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 1,
  },
  {
    filename: 'cli-opencode-feature-map.svg',
    category: 'opencode',
    titleAr: 'خريطة ميزات OpenCode',
    altAr: 'رسم بياني يوضح خريطة الميزات الشاملة لـ OpenCode',
    captionAr: 'الشكل ٣٩: خريطة ميزات OpenCode',
    titleEn: 'OpenCode Feature Map',
    altEn: 'Feature map diagram for OpenCode',
    captionEn: 'Figure 39: OpenCode feature map',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 1,
  },
  {
    filename: 'cli-opencode-config-layers.svg',
    category: 'opencode',
    titleAr: 'طبقات الإعدادات في OpenCode',
    altAr: 'رسم بياني يوضح طبقات الإعدادات المختلفة في OpenCode',
    captionAr: 'الشكل ٤٠: طبقات الإعدادات في OpenCode',
    titleEn: 'OpenCode Configuration Layers',
    altEn: 'Configuration layers diagram for OpenCode',
    captionEn: 'Figure 40: OpenCode configuration layers',
    relatedArticles: ['opencode-comprehensive-guide'],
    priority: 2,
  },
  {
    filename: 'cli-opencode-installation-options.svg',
    category: 'opencode',
    titleAr: 'خيارات تثبيت OpenCode',
    altAr: 'رسم بياني يوضح خيارات التثبيت المختلفة لـ OpenCode',
    captionAr: 'الشكل ٤١: خيارات تثبيت OpenCode',
    titleEn: 'OpenCode Installation Options',
    altEn: 'Installation options diagram for OpenCode',
    captionEn: 'Figure 41: OpenCode installation options',
    relatedArticles: ['opencode-comprehensive-guide', 'prep-your-machine'],
    priority: 1,
  },

  // ===== COMPARISON (7 SVGs) =====
  {
    filename: 'comparison-use-case-matrix.svg',
    category: 'comparison',
    titleAr: 'مصفوفة حالات الاستخدام',
    altAr: 'رسم بياني يوضح مصفوفة حالات الاستخدام لأدوات البرمجة بالذكاء الاصطناعي',
    captionAr: 'الشكل ٤٢: مصفوفة حالات الاستخدام',
    titleEn: 'Use Case Matrix',
    altEn: 'Use case matrix diagram for AI coding tools',
    captionEn: 'Figure 42: Use case matrix',
    relatedArticles: ['cursor-vs-windsurf'],
    priority: 1,
  },
  {
    filename: 'comparison-pricing-visual.svg',
    category: 'comparison',
    titleAr: 'مقارنة الأسعار البصرية',
    altAr: 'رسم بياني بصري يوضح مقارنة الأسعار بين أدوات البرمجة بالذكاء الاصطناعي',
    captionAr: 'الشكل ٤٣: مقارنة الأسعار البصرية',
    titleEn: 'Pricing Visual Comparison',
    altEn: 'Visual pricing comparison diagram',
    captionEn: 'Figure 43: Visual pricing comparison',
    relatedArticles: ['cursor-vs-windsurf'],
    priority: 1,
  },
  {
    filename: 'comparison-ux-grid.svg',
    category: 'comparison',
    titleAr: 'شبكة مقارنة تجربة المستخدم',
    altAr: 'رسم بياني يوضح مقارنة تجربة المستخدم بين الأدوات المختلفة',
    captionAr: 'الشكل ٤٤: شبكة مقارنة تجربة المستخدم',
    titleEn: 'UX Comparison Grid',
    altEn: 'User experience comparison grid',
    captionEn: 'Figure 44: UX comparison grid',
    relatedArticles: ['cursor-vs-windsurf'],
    priority: 2,
  },
  {
    filename: 'comparison-radar-chart.svg',
    category: 'comparison',
    titleAr: 'مخطط رادار للمقارنة الشاملة',
    altAr: 'رسم بياني راداري يوضح مقارنة شاملة بين أدوات البرمجة بالذكاء الاصطناعي',
    captionAr: 'الشكل ٤٥: مخطط رادار للمقارنة الشاملة',
    titleEn: 'Comprehensive Radar Chart',
    altEn: 'Comprehensive comparison radar chart',
    captionEn: 'Figure 45: Comprehensive radar chart',
    relatedArticles: ['cursor-vs-windsurf'],
    priority: 2,
  },
  {
    filename: 'comparison-quality-barchart.svg',
    category: 'comparison',
    titleAr: 'مخطط جودة الأدوات',
    altAr: 'رسم بياني يوضح جودة أدوات البرمجة بالذكاء الاصطناعي',
    captionAr: 'الشكل ٤٦: مخطط جودة الأدوات',
    titleEn: 'Quality Bar Chart',
    altEn: 'Quality bar chart for AI coding tools',
    captionEn: 'Figure 46: Quality bar chart',
    relatedArticles: ['cursor-vs-windsurf', 'ai-tools-quality-comparison'],
    priority: 2,
  },
  {
    filename: 'comparison-feature-matrix.svg',
    category: 'comparison',
    titleAr: 'مصفوفة مقارنة الميزات',
    altAr: 'رسم بياني يوضح مصفوفة مقارنة الميزات بين الأدوات المختلفة',
    captionAr: 'الشكل ٤٧: مصفوفة مقارنة الميزات',
    titleEn: 'Feature Comparison Matrix',
    altEn: 'Feature comparison matrix diagram',
    captionEn: 'Figure 47: Feature comparison matrix',
    relatedArticles: ['cursor-vs-windsurf'],
    priority: 1,
  },
  {
    filename: 'comparison-decision-tree.svg',
    category: 'comparison',
    titleAr: 'شجرة القرار لاختيار الأداة',
    altAr: 'رسم بياني يوضح شجرة القرار لاختيار أداة البرمجة بالذكاء الاصطناعي المناسبة',
    captionAr: 'الشكل ٤٨: شجرة القرار لاختيار الأداة',
    titleEn: 'Tool Selection Decision Tree',
    altEn: 'Decision tree for choosing the right AI coding tool',
    captionEn: 'Figure 48: Tool selection decision tree',
    relatedArticles: ['cursor-vs-windsurf', 'the-vibe-stack'],
    priority: 1,
  },

  // ===== WORKFLOW (4 SVGs) =====
  {
    filename: 'workflow-context-awareness.svg',
    category: 'workflow',
    titleAr: 'الوعي بالسياق في البرمجة',
    altAr: 'رسم بياني يوضح الوعي بالسياق في البرمجة بمساعدة الذكاء الاصطناعي',
    captionAr: 'الشكل ٤٩: الوعي بالسياق في البرمجة',
    titleEn: 'Context Awareness in Coding',
    altEn: 'Context awareness diagram in AI-assisted coding',
    captionEn: 'Figure 49: Context awareness in coding',
    relatedArticles: ['conversational-coding'],
    priority: 1,
  },
  {
    filename: 'workflow-multi-agent.svg',
    category: 'workflow',
    titleAr: 'سير عمل الوكلاء المتعددين',
    altAr: 'رسم بياني يوضح سير عمل الوكلاء المتعددين في البرمجة بالذكاء الاصطناعي',
    captionAr: 'الشكل ٥٠: سير عمل الوكلاء المتعددين',
    titleEn: 'Multi-Agent Workflow',
    altEn: 'Multi-agent workflow diagram',
    captionEn: 'Figure 50: Multi-agent workflow',
    relatedArticles: ['multi-agent-workflows'],
    priority: 1,
  },
  {
    filename: 'workflow-traditional-coding.svg',
    category: 'workflow',
    titleAr: 'البرمجة التقليدية مقابل الإحساس',
    altAr: 'رسم بياني يوضح الفرق بين البرمجة التقليدية والبرمجة بالإحساس',
    captionAr: 'الشكل ٥١: البرمجة التقليدية مقابل الإحساس',
    titleEn: 'Traditional vs Vibe Coding',
    altEn: 'Traditional coding vs vibe coding comparison',
    captionEn: 'Figure 51: Traditional vs vibe coding',
    relatedArticles: ['what-is-vibe-coding'],
    priority: 2,
  },
  {
    filename: 'workflow-vibecoding.svg',
    category: 'workflow',
    titleAr: 'سير عمل البرمجة بالإحساس',
    altAr: 'رسم بياني يوضح سير عمل البرمجة بالإحساس بالتفصيل',
    captionAr: 'الشكل ٥٢: سير عمل البرمجة بالإحساس',
    titleEn: 'Vibe Coding Workflow',
    altEn: 'Detailed vibe coding workflow diagram',
    captionEn: 'Figure 52: Vibe coding workflow',
    relatedArticles: ['what-is-vibe-coding'],
    priority: 1,
  },

  // ===== ADDITIONAL TOOLS (3 more to reach 55 total) =====
  {
    filename: 'comparison-cursor-windsurf-feature.svg',
    category: 'comparison',
    titleAr: 'مقارنة Cursor مع Windsurf',
    altAr: 'رسم بياني يقارن بين Cursor و Windsurf',
    captionAr: 'الشكل ٥٣: مقارنة Cursor مع Windsurf',
    titleEn: 'Cursor vs Windsurf Comparison',
    altEn: 'Comparison diagram of Cursor vs Windsurf',
    captionEn: 'Figure 53: Cursor vs Windsurf comparison',
    relatedArticles: ['cursor-vs-windsurf'],
    priority: 1,
  },
  {
    filename: 'workflow-ai-pair-programming.svg',
    category: 'workflow',
    titleAr: 'البرمجة الثنائية بالذكاء الاصطناعي',
    altAr: 'رسم بياني يوضح مفهوم البرمجة الثنائية بمساعدة الذكاء الاصطناعي',
    captionAr: 'الشكل ٥٤: البرمجة الثنائية بالذكاء الاصطناعي',
    titleEn: 'AI Pair Programming',
    altEn: 'AI pair programming workflow diagram',
    captionEn: 'Figure 54: AI pair programming workflow',
    relatedArticles: ['conversational-coding'],
    priority: 1,
  },
  {
    filename: 'getting-started-tool-selection.svg',
    category: 'getting-started',
    titleAr: 'اختيار الأداة المناسبة',
    altAr: 'رسم بياني يساعد في اختيار أداة البرمجة بالذكاء الاصطناعي المناسبة',
    captionAr: 'الشكل ٥٥: دليل اختيار الأداة',
    titleEn: 'Tool Selection Guide',
    altEn: 'Tool selection guide diagram',
    captionEn: 'Figure 55: Tool selection guide',
    relatedArticles: ['the-vibe-stack'],
    priority: 1,
  },
];

/**
 * Get diagram entry by filename
 */
export function getDiagramByFilename(filename: string): DiagramEntry | undefined {
  return diagramRegistry.find((entry) => entry.filename === filename);
}

/**
 * Get all diagrams for a specific category
 */
export function getDiagramsByCategory(category: DiagramCategory): DiagramEntry[] {
  return diagramRegistry.filter((entry) => entry.category === category);
}

/**
 * Get diagrams for a specific article
 */
export function getDiagramsForArticle(articleSlug: string): DiagramEntry[] {
  return diagramRegistry.filter((entry) =>
    entry.relatedArticles.includes(articleSlug)
  );
}

/**
 * Get priority diagrams (above-the-fold)
 */
export function getPriorityDiagrams(): DiagramEntry[] {
  return diagramRegistry.filter((entry) =>
    PRIORITY_DIAGRAMS.has(entry.filename)
  );
}

/**
 * Get diagrams by priority level
 */
export function getDiagramsByPriority(priority: DiagramPriority): DiagramEntry[] {
  return diagramRegistry.filter((entry) => entry.priority === priority);
}

/**
 * Check if a diagram should be loaded with priority
 */
export function isPriorityDiagram(filename: string): boolean {
  return PRIORITY_DIAGRAMS.has(filename);
}

/**
 * Get diagram statistics
 */
export function getDiagramStatistics(): {
  total: number;
  byCategory: Record<DiagramCategory, number>;
  byPriority: Record<1 | 2 | 3, number>;
} {
  const byCategory: Record<DiagramCategory, number> = {
    'claude-cli': 0,
    'copilot-cli': 0,
    'opencode': 0,
    'comparison': 0,
    'workflow': 0,
    'getting-started': 0,
    'cli-overview': 0,
  };

  const byPriority = { 1: 0, 2: 0, 3: 0 };

  for (const entry of diagramRegistry) {
    byCategory[entry.category]++;
    byPriority[entry.priority]++;
  }

  return {
    total: diagramRegistry.length,
    byCategory,
    byPriority,
  };
}

/**
 * Validate that all diagrams in registry have required Arabic metadata
 */
export function validateDiagramRegistry(): {
  valid: boolean;
  missingMetadata: string[];
} {
  const missingMetadata: string[] = [];

  for (const entry of diagramRegistry) {
    if (!entry.titleAr || !entry.altAr || !entry.captionAr) {
      missingMetadata.push(entry.filename);
    }
  }

  return {
    valid: missingMetadata.length === 0,
    missingMetadata,
  };
}

/**
 * Get all diagram filenames
 */
export function getAllDiagramFilenames(): string[] {
  return diagramRegistry.map((entry) => entry.filename);
}

/**
 * Search diagrams by Arabic or English title
 */
export function searchDiagrams(query: string): DiagramEntry[] {
  const lowerQuery = query.toLowerCase();
  return diagramRegistry.filter(
    (entry) =>
      entry.titleAr.toLowerCase().includes(lowerQuery) ||
      entry.titleEn?.toLowerCase().includes(lowerQuery) ||
      entry.altAr.toLowerCase().includes(lowerQuery) ||
      entry.altEn?.toLowerCase().includes(lowerQuery)
  );
}
