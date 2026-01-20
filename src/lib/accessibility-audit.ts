/**
 * Accessibility Audit Utilities
 *
 * Comprehensive accessibility auditing system for checking WCAG 2.1 AA compliance
 * across wiki content, components, and interactive elements.
 */

// ============================================================================
// Type Definitions
// ============================================================================

export type AuditSeverity = 'critical' | 'serious' | 'moderate' | 'minor';

export type AuditCategory =
  | 'images'
  | 'color_contrast'
  | 'forms'
  | 'keyboard'
  | 'semantics'
  | 'aria'
  | 'focus_management'
  | 'language'
  | 'tables'
  | 'lists'
  | 'headings'
  | 'links'
  | 'media'
  | 'code_blocks'
  | 'error_handling';

export type AuditStandpoint = 'wcag_a' | 'wcag_aa' | 'wcag_aaa' | 'best_practice';

export interface AccessibilityIssue {
  id: string;
  category: AuditCategory;
  severity: AuditSeverity;
  standpoint: AuditStandpoint;
  wcagCriteria: string; // e.g., "1.4.3 Contrast (Minimum)"
  title: string;
  description: string;
  impact: string;
  location?: {
    file?: string;
    line?: number;
    column?: number;
    selector?: string;
  };
  suggestion: string;
  codeExample?: {
    bad: string;
    good: string;
  };
  autoFixable: boolean;
}

export interface AccessibilityAudit {
  timestamp: Date;
  overallScore: number; // 0-100
  wcagLevel: 'A' | 'AA' | 'AAA' | 'FAIL';
  totalIssues: number;
  criticalIssues: number;
  seriousIssues: number;
  moderateIssues: number;
  minorIssues: number;
  issues: AccessibilityIssue[];
  summary: {
    passedChecks: number;
    failedChecks: number;
    percentageCompliant: number;
  };
  recommendations: string[];
}

export interface AuditOptions {
  wcagLevel?: 'A' | 'AA' | 'AAA';
  checkColorContrast?: boolean;
  checkImages?: boolean;
  checkForms?: boolean;
  checkKeyboard?: boolean;
  checkSemantics?: boolean;
  checkARIA?: boolean;
  includeBestPractices?: boolean;
}

// ============================================================================
// Color Contrast Utilities
// ============================================================================

/**
 * Converts hex color to RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Converts RGB to relative luminance
 * Formula from WCAG 2.0 specification
 */
export function relativeLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((value) => {
    const sRGB = value / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculates contrast ratio between two colors
 */
export function contrastRatio(foreground: string, background: string): number {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);

  if (!fg || !bg) {
    return 0;
  }

  const fgLum = relativeLuminance(fg.r, fg.g, fg.b);
  const bgLum = relativeLuminance(bg.r, bg.g, bg.b);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Checks if contrast meets WCAG standards
 */
export function checkColorContrast(
  foreground: string,
  background: string,
  fontSize: number = 16,
  bold: boolean = false,
  level: 'A' | 'AA' | 'AAA' = 'AA'
): { passes: boolean; ratio: number; required: number } {
  const ratio = contrastRatio(foreground, background);

  // Determine if text is large (>= 18pt or 14pt bold)
  const isLargeText = fontSize >= 18 || (fontSize >= 14 && bold);

  let required: number;
  if (level === 'AAA') {
    required = isLargeText ? 4.5 : 7;
  } else if (level === 'AA') {
    required = isLargeText ? 3 : 4.5;
  } else {
    // Level A
    required = isLargeText ? 3 : 4.5;
  }

  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
  };
}

// ============================================================================
// HTML Content Analysis
// ============================================================================

/**
 * Checks for missing alt text on images
 */
export function checkImageAltText(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const imgRegex = /<img[^>]*>/gi;
  const matches = html.match(imgRegex) || [];

  matches.forEach((img, index) => {
    const hasAlt = /alt\s*=\s*["']([^"']*)["']/i.test(img);
    const altEmpty = /alt\s*=\s*["']\s*["']/i.test(img);
    const srcMatch = /src\s*=\s*["']([^"']*)["']/i.exec(img);

    if (!hasAlt) {
      issues.push({
        id: `missing-alt-${index}`,
        category: 'images',
        severity: 'critical',
        standpoint: 'wcag_a',
        wcagCriteria: '1.1.1 Non-text Content',
        title: 'Image missing alt attribute',
        description: `Image found without alt attribute: ${srcMatch ? srcMatch[1] : 'unknown'}`,
        impact: 'Screen reader users cannot understand the purpose or content of this image.',
        suggestion: 'Add a descriptive alt attribute to the image. For decorative images, use alt=""',
        codeExample: {
          bad: '<img src="chart.png">',
          good: '<img src="chart.png" alt="Bar chart showing sales increased by 25% in Q4">',
        },
        autoFixable: false,
      });
    } else if (altEmpty) {
      // Check if image is truly decorative (no meaningful info)
      const isLikelyDecorative = /decorative|spacer|bullet/i.test(img);
      if (!isLikelyDecorative && srcMatch) {
        const src = srcMatch[1];
        const likelyInformative = /(chart|graph|diagram|photo|illustration)/i.test(src);
        if (likelyInformative) {
          issues.push({
            id: `empty-alt-${index}`,
            category: 'images',
            severity: 'serious',
            standpoint: 'wcag_a',
            wcagCriteria: '1.1.1 Non-text Content',
            title: 'Image has empty alt text but appears informative',
            description: `Image may contain important information: ${src}`,
            impact: 'Screen reader users will miss important visual information.',
            suggestion: 'Provide a meaningful description of the image content in the alt attribute.',
            codeExample: {
              bad: '<img src="chart.png" alt="">',
              good: '<img src="chart.png" alt="Bar chart showing quarterly sales data">',
            },
            autoFixable: false,
          });
        }
      }
    }
  });

  return issues;
}

/**
 * Checks for proper heading hierarchy
 */
export function checkHeadingHierarchy(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];
  const headingRegex = /<h([1-6])[^>]*>(.*?)<\/h\1>/gi;
  const headings: { level: number; text: string; position: number }[] = [];

  let match;
  let position = 0;
  while ((match = headingRegex.exec(html)) !== null) {
    headings.push({
      level: parseInt(match[1], 10),
      text: match[2].trim(),
      position: match.index,
    });
  }

  let previousLevel = 0;
  headings.forEach((heading, index) => {
    if (heading.level > previousLevel + 1 && previousLevel !== 0) {
      issues.push({
        id: `heading-skip-${index}`,
        category: 'headings',
        severity: 'moderate',
        standpoint: 'wcag_a',
        wcagCriteria: '1.3.1 Info and Relationships',
        title: 'Heading level skipped',
        description: `Heading H${heading.level} follows H${previousLevel}, missing intermediate levels`,
        impact: 'Screen reader users may lose context when heading levels are skipped.',
        suggestion: `Use H${previousLevel + 1} instead of H${heading.level}, or insert H${previousLevel + 1} as a section heading.`,
        codeExample: {
          bad: '<h2>Section</h2>\n<h4>Subsection</h4>',
          good: '<h2>Section</h2>\n<h3>Subsection</h3>',
        },
        autoFixable: false,
      });
    }
    previousLevel = heading.level;
  });

  // Check for heading as first element
  if (headings.length > 0 && headings[0].level !== 1) {
    issues.push({
      id: 'first-heading-not-h1',
      category: 'headings',
      severity: 'serious',
      standpoint: 'best_practice',
      wcagCriteria: '1.3.1 Info and Relationships',
      title: 'First heading is not H1',
      description: `Document starts with H${headings[0].level} instead of H1`,
      impact: 'Screen reader users expect the first heading to be H1 for the page title.',
      suggestion: 'Use H1 for the main page title and maintain proper hierarchy.',
      codeExample: {
        bad: '<h2>Welcome to Our Site</h2>',
        good: '<h1>Welcome to Our Site</h1>',
      },
      autoFixable: false,
    });
  }

  return issues;
}

/**
 * Checks form accessibility
 */
export function checkFormAccessibility(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for inputs without labels
  const inputRegex = /<input(?![^>]*\slabel\s*=[^>]*)[^>]*>/gi;
  const inputs = html.match(inputRegex) || [];

  inputs.forEach((input, index) => {
    const hasId = /id\s*=\s*["']([^"']+)["']/i.test(input);
    const hasAriaLabel = /aria-label\s*=\s*["']([^"']+)["']/i.test(input);
    const hasAriaLabelledby = /aria-labelledby\s*=\s*["']([^"']+)["']/i.test(input);
    const hasPlaceholder = /placeholder\s*=\s*["']([^"']+)["']/i.test(input);
    const typeMatch = /type\s*=\s*["']([^"']+)["']/i.exec(input);
    const type = typeMatch ? typeMatch[1] : 'text';

    if (!hasId && !hasAriaLabel && !hasAriaLabelledby && !hasPlaceholder) {
      issues.push({
        id: `input-no-label-${index}`,
        category: 'forms',
        severity: 'critical',
        standpoint: 'wcag_a',
        wcagCriteria: '1.3.1 Info and Relationships',
        title: 'Form input without label',
        description: `Input of type "${type}" found without an accessible label`,
        impact: 'Screen reader users cannot understand the purpose of this input field.',
        suggestion: 'Add a label element associated with this input, or use aria-label.',
        codeExample: {
          bad: '<input type="text" name="email">',
          good: '<label for="email">Email:</label>\n<input type="text" id="email" name="email">',
        },
        autoFixable: false,
      });
    }
  });

  // Check for submit buttons without clear purpose
  const submitRegex = /<button[^>]*type\s*=\s*["']submit["'][^>]*>(.*?)<\/button>/gi;
  const submitButtons = html.match(submitRegex) || [];

  submitButtons.forEach((button, index) => {
    const text = button.replace(/<button[^>]*>/i, '').replace(/<\/button>/i, '').trim();
    if (!text || text === 'Submit' || text === 'إرسال' || /^(submit|send|go)$/i.test(text)) {
      issues.push({
        id: `submit-button-generic-${index}`,
        category: 'forms',
        severity: 'moderate',
        standpoint: 'best_practice',
        wcagCriteria: '2.4.6 Headings and Labels',
        title: 'Submit button with generic text',
        description: 'Submit button uses generic text that does not describe the action',
        impact: 'Users may not understand what will happen when they click the button.',
        suggestion: 'Use descriptive text that explains the specific action.',
        codeExample: {
          bad: '<button type="submit">Submit</button>',
          good: '<button type="submit">Create Account</button>',
        },
        autoFixable: false,
      });
    }
  });

  return issues;
}

/**
 * Checks for ARIA issues
 */
export function checkAria(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for ARIA attributes on elements that hide content
  const ariaHiddenRegex = /aria-hidden\s*=\s*["']true["'][^>]*>/gi;
  const ariaHiddenMatches = html.match(ariaHiddenRegex) || [];

  // Check if aria-hidden elements contain focusable content
  ariaHiddenMatches.forEach((match, index) => {
    // Look for interactive elements in the aria-hidden section
    const start = html.indexOf(match);
    const end = html.indexOf('</div>', start);
    const section = html.substring(start, end + 6);

    if (/<button|<a\s|<input|<textarea|<select/i.test(section)) {
      issues.push({
        id: `aria-hidden-focusable-${index}`,
        category: 'aria',
        severity: 'serious',
        standpoint: 'wcag_a',
        wcagCriteria: '4.1.2 Name, Role, Value',
        title: 'aria-hidden element contains focusable content',
        description: 'Element marked with aria-hidden="true" contains interactive elements',
        impact: 'Keyboard users can still focus on hidden content, causing confusion.',
        suggestion: 'Remove interactive elements from aria-hidden sections, or use CSS for hiding instead.',
        codeExample: {
          bad: '<div aria-hidden="true"><button>Click me</button></div>',
          good: '<div class="visually-hidden"><button>Click me</button></div>',
        },
        autoFixable: false,
      });
    }
  });

  // Check for invalid ARIA roles
  const roleRegex = /role\s*=\s*["']([^"']+)["']/gi;
  const roles = html.match(roleRegex) || [];

  const validRoles = new Set([
    'alert',
    'alertdialog',
    'application',
    'article',
    'banner',
    'button',
    'cell',
    'checkbox',
    'columnheader',
    'combobox',
    'complementary',
    'contentinfo',
    'definition',
    'dialog',
    'directory',
    'document',
    'feed',
    'figure',
    'form',
    'grid',
    'gridcell',
    'group',
    'heading',
    'img',
    'link',
    'list',
    'listbox',
    'listitem',
    'log',
    'main',
    'marquee',
    'math',
    'menu',
    'menubar',
    'menuitem',
    'menuitemcheckbox',
    'menuitemradio',
    'navigation',
    'none',
    'note',
    'option',
    'presentation',
    'progressbar',
    'radio',
    'radiogroup',
    'region',
    'row',
    'rowgroup',
    'rowheader',
    'scrollbar',
    'search',
    'searchbox',
    'separator',
    'slider',
    'spinbutton',
    'status',
    'switch',
    'tab',
    'table',
    'tablist',
    'tabpanel',
    'term',
    'textbox',
    'timer',
    'toolbar',
    'tooltip',
    'tree',
    'treegrid',
    'treeitem',
  ]);

  roles.forEach((roleMatch, index) => {
    const roleExec = /role\s*=\s*["']([^"']+)["']/i.exec(roleMatch);
    if (roleExec) {
      const role = roleExec[1];
      if (!validRoles.has(role)) {
        issues.push({
          id: `invalid-role-${index}`,
          category: 'aria',
          severity: 'serious',
          standpoint: 'wcag_a',
          wcagCriteria: '1.3.1 Info and Relationships',
          title: `Invalid ARIA role: ${role}`,
          description: `The role "${role}" is not a valid ARIA role`,
          impact: 'Assistive technologies may not recognize or handle this role correctly.',
          suggestion: 'Use a valid ARIA role from the WAI-ARIA specification.',
          codeExample: {
            bad: '<div role="header">',
            good: '<div role="banner">',
          },
          autoFixable: false,
        });
      }
    }
  });

  return issues;
}

/**
 * Checks link accessibility
 */
export function checkLinks(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for empty links
  const linkRegex = /<a\s+href[^>]*>(.*?)<\/a>/gi;
  const links = html.match(linkRegex) || [];

  links.forEach((link, index) => {
    const text = link.replace(/<a\s+href[^>]*>/i, '').replace(/<\/a>/i, '').trim();

    // Empty link
    if (!text) {
      issues.push({
        id: `empty-link-${index}`,
        category: 'links',
        severity: 'serious',
        standpoint: 'wcag_a',
        wcagCriteria: '2.4.4 Link Purpose (In Context)',
        title: 'Empty link with no text content',
        description: 'Link found with no accessible text content',
        impact: 'Screen reader users cannot determine the purpose of this link.',
        suggestion: 'Add descriptive text to the link or use aria-label.',
        codeExample: {
          bad: '<a href="/about"></a>',
          good: '<a href="/about">About Us</a>',
        },
        autoFixable: false,
      });
    }

    // Generic link text
    const genericPatterns = /^(click here|here|read more|more|link|الضغط هنا|اضغط هنا|اقرأ المزيد|المزيد)$/i;
    if (genericPatterns.test(text) && !/aria-label|aria-labelledby/i.test(link)) {
      issues.push({
        id: `generic-link-${index}`,
        category: 'links',
        severity: 'moderate',
        standpoint: 'best_practice',
        wcagCriteria: '2.4.4 Link Purpose (In Context)',
        title: 'Link with generic text',
        description: `Link uses generic text: "${text}"`,
        impact: 'Screen reader users navigating by links cannot determine the purpose without context.',
        suggestion: 'Use descriptive text that explains the destination or action.',
        codeExample: {
          bad: 'Click <a href="/documentation">here</a> to read the docs',
          good: 'Read the <a href="/documentation">documentation</a> for more details',
        },
        autoFixable: false,
      });
    }

    // URL as link text
    if (/^https?:\/\//.test(text)) {
      issues.push({
        id: `url-link-${index}`,
        category: 'links',
        severity: 'minor',
        standpoint: 'best_practice',
        wcagCriteria: '2.4.4 Link Purpose (In Context)',
        title: 'Link displays raw URL as text',
        description: 'Link uses the full URL as the visible text',
        impact: 'Screen reader users must listen to the entire URL, which can be lengthy.',
        suggestion: 'Use descriptive text instead of the raw URL.',
        codeExample: {
          bad: '<a href="https://example.com/documentation">https://example.com/documentation</a>',
          good: '<a href="https://example.com/documentation">Read the documentation</a>',
        },
        autoFixable: false,
      });
    }
  });

  return issues;
}

/**
 * Checks table accessibility
 */
export function checkTables(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for tables without headers
  const tableRegex = /<table[^>]*>(.*?)<\/table>/gis;
  const tables = html.match(tableRegex) || [];

  tables.forEach((table, index) => {
    const hasTh = /<th[^>]*>/i.test(table);

    if (!hasTh) {
      issues.push({
        id: `table-no-headers-${index}`,
        category: 'tables',
        severity: 'serious',
        standpoint: 'wcag_a',
        wcagCriteria: '1.3.1 Info and Relationships',
        title: 'Table without header cells',
        description: 'Table found without any <th> header cells',
        impact: 'Screen reader users cannot understand the structure and relationships within the table.',
        suggestion: 'Add <th> elements for row and/or column headers with proper scope attributes.',
        codeExample: {
          bad: '<table>\n<tr><td>Name</td><td>Age</td></tr>\n<tr><td>John</td><td>30</td></tr>\n</table>',
          good: '<table>\n<tr><th scope="col">Name</th><th scope="col">Age</th></tr>\n<tr><td>John</td><td>30</td></tr>\n</table>',
        },
        autoFixable: false,
      });
    }

    // Check for scope attributes on headers
    const thRegex = /<th(?![^>]*\sscope\s*=)[^>]*>/gi;
    const thWithoutScope = table.match(thRegex) || [];

    if (thWithoutScope.length > 0) {
      issues.push({
        id: `th-no-scope-${index}`,
        category: 'tables',
        severity: 'moderate',
        standpoint: 'best_practice',
        wcagCriteria: '1.3.1 Info and Relationships',
        title: 'Table header without scope attribute',
        description: `${thWithoutScope.length} header cell(s) found without scope attribute`,
        impact: 'Screen reader users may not understand if headers apply to rows or columns.',
        suggestion: 'Add scope="col" for column headers or scope="row" for row headers.',
        codeExample: {
          bad: '<th>Name</th>',
          good: '<th scope="col">Name</th>',
        },
        autoFixable: false,
      });
    }

    // Check for caption
    const hasCaption = /<caption[^>]*>/i.test(table);
    if (!hasCaption) {
      issues.push({
        id: `table-no-caption-${index}`,
        category: 'tables',
        severity: 'minor',
        standpoint: 'best_practice',
        wcagCriteria: '1.3.1 Info and Relationships',
        title: 'Table without caption',
        description: 'Table does not have a <caption> element',
        impact: 'Screen reader users may not understand the purpose of the table.',
        suggestion: 'Add a <caption> element as the first child of the table to describe its purpose.',
        codeExample: {
          bad: '<table>\n<thead>...</thead>\n</table>',
          good: '<table>\n<caption>Quarterly sales figures for 2024</caption>\n<thead>...</thead>\n</table>',
        },
        autoFixable: false,
      });
    }
  });

  return issues;
}

/**
 * Checks list accessibility
 */
export function checkLists(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for proper list nesting
  const listRegex = /<(ul|ol)>(.*?)<\/\1>/gis;
  const lists = html.match(listRegex) || [];

  lists.forEach((list, index) => {
    // Check if list items are direct children
    const listItemCount = (list.match(/<li[^>]*>/gi) || []).length;

    // Check if there's direct content without <li>
    const cleanList = list.replace(/<(ul|ol)[^>]*>/i, '').replace(/<\/(ul|ol)>/i, '');
    const contentOutsideLi = cleanList.replace(/<li[^>]*>.*?<\/li>/gi, '').trim();

    if (contentOutsideLi && contentOutsideLi.length > 0) {
      issues.push({
        id: `list-content-outside-li-${index}`,
        category: 'lists',
        severity: 'serious',
        standpoint: 'wcag_a',
        wcagCriteria: '1.3.1 Info and Relationships',
        title: 'List content outside list items',
        description: 'Content found directly inside <ul> or <ol> without <li> wrapper',
        impact: 'Screen reader users may not correctly identify this content as part of a list.',
        suggestion: 'Wrap all list content in <li> elements.',
        codeExample: {
          bad: '<ul>\n  <li>Item 1</li>\n  Item 2 (not in li)\n</ul>',
          good: '<ul>\n  <li>Item 1</li>\n  <li>Item 2</li>\n</ul>',
        },
        autoFixable: false,
      });
    }
  });

  return issues;
}

/**
 * Checks code block accessibility
 */
export function checkCodeBlocks(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for code blocks without language specification
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
  const preCodeRegex = /<pre[^>]*>\s*<code(?![^>]*\sclass\s*=[^>]*)[^>]*>/gi;
  const preCodeMatches = html.match(preCodeRegex) || [];

  preCodeMatches.forEach((match, index) => {
    issues.push({
      id: `code-no-language-${index}`,
      category: 'code_blocks',
      severity: 'minor',
      standpoint: 'best_practice',
      wcagCriteria: '1.3.1 Info and Relationships',
      title: 'Code block without language specification',
      description: '<code> element found without language class attribute',
      impact: 'Screen readers cannot announce the programming language, affecting code comprehension.',
      suggestion: 'Add a class attribute specifying the programming language (e.g., class="language-javascript").',
      codeExample: {
        bad: '<pre><code>const x = 5;</code></pre>',
        good: '<pre><code class="language-javascript">const x = 5;</code></pre>',
      },
      autoFixable: false,
    });
  });

  return issues;
}

/**
 * Checks focus management
 */
export function checkFocusManagement(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for tabindex > 0
  const tabRegex = /tabindex\s*=\s*["']([1-9]\d*)["']/gi;
  const tabMatches = html.match(tabRegex) || [];

  tabMatches.forEach((match, index) => {
    const valueMatch = /tabindex\s*=\s*["']([1-9]\d*)["']/i.exec(match);
    const value = valueMatch ? valueMatch[1] : '';

    issues.push({
      id: `tabindex-positive-${index}`,
      category: 'focus_management',
      severity: 'serious',
      standpoint: 'best_practice',
      wcagCriteria: '2.4.3 Focus Order',
      title: `Positive tabindex value: ${value}`,
      description: 'Element has tabindex greater than 0',
      impact: 'Disrupts the natural tab order and makes keyboard navigation unpredictable.',
      suggestion: 'Use tabindex="0" for elements that are not normally focusable, or organize HTML to achieve the desired tab order.',
      codeExample: {
        bad: '<div tabindex="5">Important content</div>',
        good: '<div tabindex="0">Important content</div> <!-- or better: use a button -->',
      },
      autoFixable: false,
    });
  });

  return issues;
}

/**
 * Checks language declaration
 */
export function checkLanguage(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for lang attribute on html
  const htmlTagMatch = /<html[^>]*>/i.exec(html);
  if (htmlTagMatch) {
    const hasLang = /lang\s*=\s*["']([^"']+)["']/i.test(htmlTagMatch[0]);
    if (!hasLang) {
      issues.push({
        id: 'no-lang-attribute',
        category: 'language',
        severity: 'critical',
        standpoint: 'wcag_a',
        wcagCriteria: '3.1.1 Language of Page',
        title: 'HTML element missing lang attribute',
        description: 'The root <html> element does not have a lang attribute',
        impact: 'Screen readers cannot determine the page language, affecting pronunciation and translation.',
        suggestion: 'Add lang attribute to the <html> element (e.g., lang="en" or lang="ar").',
        codeExample: {
          bad: '<html>',
          good: '<html lang="en"> or <html lang="ar" dir="rtl">',
        },
        autoFixable: false,
      });
    }
  }

  // Check for lang changes without declaration
  const langChangeRegex = /lang\s*=\s*["']([^"']+)["']/gi;
  const langMatches = html.match(langChangeRegex) || [];

  // Count unique languages
  const languages = new Set<string>();
  langMatches.forEach((match) => {
    const langExec = /lang\s*=\s*["']([^"']+)["']/i.exec(match);
    if (langExec) {
      languages.add(langExec[1]);
    }
  });

  if (languages.size > 1) {
    issues.push({
      id: 'multiple-languages',
      category: 'language',
      severity: 'moderate',
      standpoint: 'best_practice',
      wcagCriteria: '3.1.2 Language of Parts',
      title: 'Multiple languages detected',
      description: `Page contains content in ${languages.size} different languages: ${Array.from(languages).join(', ')}`,
      impact: 'Screen readers may not correctly switch pronunciation for different languages.',
      suggestion: 'Use lang attribute on elements containing content in a different language.',
      codeExample: {
        bad: '<p>English text with العربية Arabic words mixed in.</p>',
        good: '<p>English text with <span lang="ar" dir="rtl">العربية</span> Arabic words.</p>',
      },
      autoFixable: false,
    });
  }

  return issues;
}

/**
 * Checks for skip links
 */
export function checkSkipLinks(html: string): AccessibilityIssue[] {
  const issues: AccessibilityIssue[] = [];

  // Check for skip navigation link
  const hasSkipLink = /<a[^>]*(?:skip|jump|bypass|goto\s+(main|content|navigation))[^>]*>/i.test(html);

  if (!hasSkipLink) {
    issues.push({
      id: 'no-skip-link',
      category: 'keyboard',
      severity: 'moderate',
      standpoint: 'wcag_a',
      wcagCriteria: '2.4.1 Bypass Blocks',
      title: 'Missing skip navigation link',
      description: 'No skip link found for bypassing repeated navigation',
      impact: 'Keyboard users must tab through all navigation on every page to reach main content.',
      suggestion: 'Add a "skip to main content" link at the top of the page that is visible on focus.',
      codeExample: {
        bad: '<body>\n<nav>...</nav>\n<main>...</main>',
        good: '<body>\n<a href="#main-content" class="skip-link">Skip to main content</a>\n<nav>...</nav>\n<main id="main-content">...</main>',
      },
      autoFixable: false,
    });
  }

  return issues;
}

// ============================================================================
// Comprehensive Audit
// ============================================================================

/**
 * Runs a comprehensive accessibility audit
 */
export function runAccessibilityAudit(
  content: string,
  options: AuditOptions = {}
): AccessibilityAudit {
  const issues: AccessibilityIssue[] = [];

  // Run all checks
  issues.push(...checkImageAltText(content));
  issues.push(...checkHeadingHierarchy(content));
  issues.push(...checkFormAccessibility(content));
  issues.push(...checkAria(content));
  issues.push(...checkLinks(content));
  issues.push(...checkTables(content));
  issues.push(...checkLists(content));
  issues.push(...checkCodeBlocks(content));
  issues.push(...checkFocusManagement(content));
  issues.push(...checkLanguage(content));
  issues.push(...checkSkipLinks(content));

  // Filter by WCAG level if specified
  const filteredIssues = options.wcagLevel
    ? issues.filter((issue) => {
        if (options.wcagLevel === 'A') {
          return (
            issue.standpoint === 'wcag_a' || issue.standpoint === 'wcag_aa' || issue.standpoint === 'wcag_aaa'
          );
        } else if (options.wcagLevel === 'AA') {
          return issue.standpoint === 'wcag_aa' || issue.standpoint === 'wcag_aaa';
        } else if (options.wcagLevel === 'AAA') {
          return issue.standpoint === 'wcag_aaa';
        }
        return true;
      })
    : issues;

  // Count by severity
  const critical = filteredIssues.filter((i) => i.severity === 'critical').length;
  const serious = filteredIssues.filter((i) => i.severity === 'serious').length;
  const moderate = filteredIssues.filter((i) => i.severity === 'moderate').length;
  const minor = filteredIssues.filter((i) => i.severity === 'minor').length;

  // Calculate score (0-100)
  // Critical: -25 points, Serious: -10, Moderate: -2, Minor: -0.5
  let score = 100;
  filteredIssues.forEach((issue) => {
    if (issue.severity === 'critical') score -= 25;
    else if (issue.severity === 'serious') score -= 10;
    else if (issue.severity === 'moderate') score -= 2;
    else if (issue.severity === 'minor') score -= 0.5;
  });
  score = Math.max(0, Math.round(score * 10) / 10);

  // Determine WCAG level
  const hasCritical = filteredIssues.some((i) => i.severity === 'critical' && i.standpoint === 'wcag_a');
  const hasSeriousA = filteredIssues.some((i) => i.severity === 'serious' && i.standpoint === 'wcag_a');
  const hasSeriousAA = filteredIssues.some((i) => i.severity === 'serious' && i.standpoint === 'wcag_aa');

  let wcagLevel: 'A' | 'AA' | 'AAA' | 'FAIL';
  if (hasCritical || hasSeriousA) {
    wcagLevel = 'FAIL';
  } else if (hasSeriousAA) {
    wcagLevel = 'A';
  } else {
    wcagLevel = 'AA';
  }

  // Generate recommendations
  const recommendations = generateRecommendations(filteredIssues);

  return {
    timestamp: new Date(),
    overallScore: score,
    wcagLevel,
    totalIssues: filteredIssues.length,
    criticalIssues: critical,
    seriousIssues: serious,
    moderateIssues: moderate,
    minorIssues: minor,
    issues: filteredIssues,
    summary: {
      passedChecks: 100 - score,
      failedChecks: filteredIssues.length,
      percentageCompliant: score,
    },
    recommendations,
  };
}

/**
 * Generates recommendations based on audit results
 */
function generateRecommendations(issues: AccessibilityIssue[]): string[] {
  const recommendations: string[] = [];

  const byCategory = new Map<AuditCategory, AccessibilityIssue[]>();
  issues.forEach((issue) => {
    const existing = byCategory.get(issue.category) || [];
    existing.push(issue);
    byCategory.set(issue.category, existing);
  });

  // Images
  const imageIssues = byCategory.get('images');
  if (imageIssues && imageIssues.length > 0) {
    recommendations.push(
      `Add alt text to ${imageIssues.length} image(s). Alt text should describe the content and purpose of each image. For decorative images, use alt="".`
    );
  }

  // Forms
  const formIssues = byCategory.get('forms');
  if (formIssues && formIssues.length > 0) {
    recommendations.push(
      `Ensure all form inputs have associated labels. Use the <label> element with the "for" attribute matching the input's id, or use aria-label.`
    );
  }

  // Headings
  const headingIssues = byCategory.get('headings');
  if (headingIssues && headingIssues.length > 0) {
    recommendations.push(
      'Fix heading hierarchy. Start with H1 for the main title and use H2-H6 in order without skipping levels.'
    );
  }

  // ARIA
  const ariaIssues = byCategory.get('aria');
  if (ariaIssues && ariaIssues.length > 0) {
    recommendations.push(
      'Review ARIA attributes. Ensure all ARIA roles are valid and that aria-hidden elements do not contain focusable content.'
    );
  }

  // Links
  const linkIssues = byCategory.get('links');
  if (linkIssues && linkIssues.length > 0) {
    recommendations.push(
      'Improve link text. Avoid generic phrases like "click here" and use descriptive text that indicates the link destination or purpose.'
    );
  }

  // Tables
  const tableIssues = byCategory.get('tables');
  if (tableIssues && tableIssues.length > 0) {
    recommendations.push(
      'Enhance table accessibility. Add <th> header cells with appropriate scope attributes, and include a <caption> describing the table purpose.'
    );
  }

  // Color contrast
  const contrastIssues = byCategory.get('color_contrast');
  if (contrastIssues && contrastIssues.length > 0) {
    recommendations.push(
      'Increase color contrast. Ensure text has a contrast ratio of at least 4.5:1 for normal text and 3:1 for large text (18pt+ or 14pt+ bold).'
    );
  }

  // Keyboard
  const keyboardIssues = byCategory.get('keyboard');
  if (keyboardIssues && keyboardIssues.length > 0) {
    recommendations.push(
      'Add a skip navigation link at the top of the page to allow keyboard users to bypass repeated navigation.'
    );
  }

  // Focus
  const focusIssues = byCategory.get('focus_management');
  if (focusIssues && focusIssues.length > 0) {
    recommendations.push(
      'Review tabindex usage. Avoid positive tabindex values and let the natural document order determine tab sequence.'
    );
  }

  return recommendations;
}

/**
 * Audits multiple articles and returns a summary
 */
export function auditMultipleArticles(
  articles: Array<{ slug: string; title: string; content: string }>,
  options?: AuditOptions
): Map<string, AccessibilityAudit> {
  const results = new Map<string, AccessibilityAudit>();

  articles.forEach((article) => {
    const audit = runAccessibilityAudit(article.content, options);
    results.set(article.slug, audit);
  });

  return results;
}

/**
 * Gets articles that fail accessibility standards
 */
export function getFailingArticles(
  audits: Map<string, AccessibilityAudit>,
  minScore: number = 80
): Array<{ slug: string; audit: AccessibilityAudit }> {
  const failing: Array<{ slug: string; audit: AccessibilityAudit }> = [];

  audits.forEach((audit, slug) => {
    if (audit.overallScore < minScore || audit.wcagLevel === 'FAIL') {
      failing.push({ slug, audit });
    }
  });

  return failing.sort((a, b) => a.audit.overallScore - b.audit.overallScore);
}

/**
 * Generates an accessibility report
 */
export function generateAccessibilityReport(audits: Map<string, AccessibilityAudit>): string {
  let report = '# Accessibility Audit Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;

  const totalArticles = audits.size;
  let totalIssues = 0;
  let totalCritical = 0;
  let totalSerious = 0;

  const scores: number[] = [];

  audits.forEach((audit) => {
    totalIssues += audit.totalIssues;
    totalCritical += audit.criticalIssues;
    totalSerious += audit.seriousIssues;
    scores.push(audit.overallScore);
  });

  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  report += '## Summary\n\n';
  report += `- **Articles Audited**: ${totalArticles}\n`;
  report += `- **Average Score**: ${Math.round(avgScore * 10) / 10}/100\n`;
  report += `- **Total Issues**: ${totalIssues}\n`;
  report += `  - Critical: ${totalCritical}\n`;
  report += `  - Serious: ${totalSerious}\n`;
  report += `  - Moderate: ${totalIssues - totalCritical - totalSerious}\n\n`;

  const failing = getFailingArticles(audits);
  if (failing.length > 0) {
    report += `## Failing Articles (${failing.length})\n\n`;
    failing.forEach(({ slug, audit }) => {
      report += `### ${slug}\n`;
      report += `- Score: ${audit.overallScore}/100\n`;
      report += `- WCAG Level: ${audit.wcagLevel}\n`;
      report += `- Issues: ${audit.totalIssues} (${audit.criticalIssues} critical, ${audit.seriousIssues} serious)\n\n`;
    });
  }

  const passing = Array.from(audits.entries()).filter(([_, audit]) => audit.overallScore >= 80);
  if (passing.length > 0) {
    report += `## Passing Articles (${passing.length})\n\n`;
    passing.forEach(([slug, audit]) => {
      report += `- **${slug}**: ${audit.overallScore}/100\n`;
    });
  }

  return report;
}

/**
 * Validates an accessibility issue object
 */
export function validateAccessibilityIssue(issue: AccessibilityIssue): boolean {
  const requiredFields = ['id', 'category', 'severity', 'standpoint', 'wcagCriteria', 'title', 'description', 'impact', 'suggestion', 'autoFixable'];

  for (const field of requiredFields) {
    if (!(field in issue)) {
      return false;
    }
  }

  const validCategories: AuditCategory[] = [
    'images', 'color_contrast', 'forms', 'keyboard', 'semantics', 'aria', 'focus_management', 'language',
    'tables', 'lists', 'headings', 'links', 'media', 'code_blocks', 'error_handling',
  ];

  const validSeverities: AuditSeverity[] = ['critical', 'serious', 'moderate', 'minor'];
  const validStandpoints: AuditStandpoint[] = ['wcag_a', 'wcag_aa', 'wcag_aaa', 'best_practice'];

  return (
    validCategories.includes(issue.category) &&
    validSeverities.includes(issue.severity) &&
    validStandpoints.includes(issue.standpoint)
  );
}

/**
 * Validates an accessibility audit object
 */
export function validateAccessibilityAudit(audit: AccessibilityAudit): boolean {
  const requiredFields = ['timestamp', 'overallScore', 'wcagLevel', 'totalIssues', 'criticalIssues', 'seriousIssues', 'moderateIssues', 'minorIssues', 'issues', 'summary'];

  for (const field of requiredFields) {
    if (!(field in audit)) {
      return false;
    }
  }

  if (audit.overallScore < 0 || audit.overallScore > 100) {
    return false;
  }

  const validWcagLevels = ['A', 'AA', 'AAA', 'FAIL'];
  if (!validWcagLevels.includes(audit.wcagLevel)) {
    return false;
  }

  return audit.issues.every(validateAccessibilityIssue);
}

/**
 * Creates an accessibility issue object
 */
export function createAccessibilityIssue(
  id: string,
  category: AuditCategory,
  severity: AuditSeverity,
  standpoint: AuditStandpoint,
  wcagCriteria: string,
  title: string,
  description: string,
  impact: string,
  suggestion: string,
  autoFixable: boolean,
  codeExample?: { bad: string; good: string }
): AccessibilityIssue {
  return {
    id,
    category,
    severity,
    standpoint,
    wcagCriteria,
    title,
    description,
    impact,
    suggestion,
    autoFixable,
    ...(codeExample && { codeExample }),
  };
}
