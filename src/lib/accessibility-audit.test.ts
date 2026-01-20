/**
 * Tests for accessibility-audit.ts
 */

import { describe, it, expect } from 'vitest';
import {
  hexToRgb,
  relativeLuminance,
  contrastRatio,
  checkColorContrast,
  checkImageAltText,
  checkHeadingHierarchy,
  checkFormAccessibility,
  checkAria,
  checkLinks,
  checkTables,
  checkLists,
  checkCodeBlocks,
  checkFocusManagement,
  checkLanguage,
  checkSkipLinks,
  runAccessibilityAudit,
  auditMultipleArticles,
  getFailingArticles,
  generateAccessibilityReport,
  validateAccessibilityIssue,
  validateAccessibilityAudit,
  createAccessibilityIssue,
  type AccessibilityIssue,
  type AccessibilityAudit,
} from './accessibility-audit';

describe('Color Contrast Utilities', () => {
  describe('hexToRgb', () => {
    it('should convert valid hex to RGB', () => {
      expect(hexToRgb('#ffffff')).toEqual({ r: 255, g: 255, b: 255 });
      expect(hexToRgb('#000000')).toEqual({ r: 0, g: 0, b: 0 });
      expect(hexToRgb('#ff0000')).toEqual({ r: 255, g: 0, b: 0 });
    });

    it('should handle hex without hash', () => {
      expect(hexToRgb('ffffff')).toEqual({ r: 255, g: 255, b: 255 });
    });

    it('should return null for invalid hex', () => {
      expect(hexToRgb('invalid')).toBeNull();
      expect(hexToRgb('#ggg')).toBeNull();
    });
  });

  describe('relativeLuminance', () => {
    it('should calculate luminance correctly', () => {
      // Pure white
      expect(relativeLuminance(255, 255, 255)).toBeCloseTo(1, 4);
      // Pure black
      expect(relativeLuminance(0, 0, 0)).toBeCloseTo(0, 4);
    });

    it('should handle grayscale values', () => {
      const grayLum = relativeLuminance(128, 128, 128);
      expect(grayLum).toBeGreaterThan(0);
      expect(grayLum).toBeLessThan(1);
    });
  });

  describe('contrastRatio', () => {
    it('should calculate contrast ratio for black and white', () => {
      const ratio = contrastRatio('#000000', '#ffffff');
      expect(ratio).toBeCloseTo(21, 0);
    });

    it('should calculate contrast ratio for colored text', () => {
      const ratio = contrastRatio('#00d9ff', '#0a0a0a');
      expect(ratio).toBeGreaterThan(0);
    });

    it('should return 0 for invalid colors', () => {
      const ratio = contrastRatio('invalid', '#ffffff');
      expect(ratio).toBe(0);
    });
  });

  describe('checkColorContrast', () => {
    it('should pass WCAG AA for high contrast', () => {
      const result = checkColorContrast('#000000', '#ffffff', 16, false, 'AA');
      expect(result.passes).toBe(true);
      expect(result.ratio).toBeCloseTo(21, 0);
    });

    it('should fail WCAG AA for low contrast', () => {
      const result = checkColorContrast('#888888', '#777777', 16, false, 'AA');
      expect(result.passes).toBe(false);
    });

    it('should use different thresholds for large text', () => {
      const normalResult = checkColorContrast('#555555', '#ffffff', 16, false, 'AA');
      const largeResult = checkColorContrast('#555555', '#ffffff', 18, false, 'AA');
      expect(largeResult.required).toBeLessThan(normalResult.required);
    });

    it('should use different thresholds for bold text', () => {
      const normalResult = checkColorContrast('#555555', '#ffffff', 14, false, 'AA');
      const boldResult = checkColorContrast('#555555', '#ffffff', 14, true, 'AA');
      expect(boldResult.required).toBeLessThan(normalResult.required);
    });

    it('should have stricter requirements for AAA', () => {
      const aaResult = checkColorContrast('#333333', '#ffffff', 16, false, 'AA');
      const aaaResult = checkColorContrast('#333333', '#ffffff', 16, false, 'AAA');
      expect(aaaResult.required).toBeGreaterThan(aaResult.required);
    });
  });
});

describe('HTML Content Analysis', () => {
  describe('checkImageAltText', () => {
    it('should detect missing alt attribute', () => {
      const html = '<img src="chart.png">';
      const issues = checkImageAltText(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].category).toBe('images');
      expect(issues[0].severity).toBe('critical');
    });

    it('should accept images with alt text', () => {
      const html = '<img src="chart.png" alt="Sales chart">';
      const issues = checkImageAltText(html);
      expect(issues).toHaveLength(0);
    });

    it('should accept empty alt for decorative images', () => {
      const html = '<img src="decorative-spacer.png" alt="">';
      const issues = checkImageAltText(html);
      expect(issues).toHaveLength(0);
    });

    it('should warn about empty alt on likely informative images', () => {
      const html = '<img src="chart.png" alt="">';
      const issues = checkImageAltText(html);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].severity).toBe('serious');
    });

    it('should detect multiple images without alt', () => {
      const html = '<img src="a.jpg"><img src="b.png">';
      const issues = checkImageAltText(html);
      expect(issues).toHaveLength(2);
    });
  });

  describe('checkHeadingHierarchy', () => {
    it('should detect skipped heading levels', () => {
      const html = '<h1>Title</h1><h2>Section</h2><h4>Subsection</h4>';
      const issues = checkHeadingHierarchy(html);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].category).toBe('headings');
      expect(issues[0].description).toContain('H4 follows H2');
    });

    it('should accept proper heading hierarchy', () => {
      const html = '<h1>Title</h1><h2>Section</h2><h3>Subsection</h3>';
      const issues = checkHeadingHierarchy(html);
      expect(issues).toHaveLength(0);
    });

    it('should detect first heading not being H1', () => {
      const html = '<h2>Title</h2><h3>Section</h3>';
      const issues = checkHeadingHierarchy(html);
      const firstHeadingIssue = issues.find((i) => i.id === 'first-heading-not-h1');
      expect(firstHeadingIssue).toBeDefined();
      expect(firstHeadingIssue?.severity).toBe('serious');
    });

    it('should allow H1 as first heading', () => {
      const html = '<h1>Title</h1><h2>Section</h2>';
      const issues = checkHeadingHierarchy(html);
      const firstHeadingIssue = issues.find((i) => i.id === 'first-heading-not-h1');
      expect(firstHeadingIssue).toBeUndefined();
    });
  });

  describe('checkFormAccessibility', () => {
    it('should detect inputs without labels', () => {
      const html = '<input type="text" name="email">';
      const issues = checkFormAccessibility(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].category).toBe('forms');
      expect(issues[0].severity).toBe('critical');
    });

    it('should accept inputs with aria-label', () => {
      const html = '<input type="text" aria-label="Email address">';
      const issues = checkFormAccessibility(html);
      expect(issues).toHaveLength(0);
    });

    it('should accept inputs with placeholder (minimal)', () => {
      const html = '<input type="text" placeholder="Enter email">';
      const issues = checkFormAccessibility(html);
      expect(issues).toHaveLength(0);
    });

    it('should detect generic submit button text', () => {
      const html = '<button type="submit">Submit</button>';
      const issues = checkFormAccessibility(html);
      const genericIssue = issues.find((i) => i.id === 'submit-button-generic-0');
      expect(genericIssue).toBeDefined();
    });

    it('should accept descriptive submit button text', () => {
      const html = '<button type="submit">Create Account</button>';
      const issues = checkFormAccessibility(html);
      const genericIssue = issues.find((i) => i.id === 'submit-button-generic-0');
      expect(genericIssue).toBeUndefined();
    });

    it('should detect Arabic generic submit button text', () => {
      const html = '<button type="submit">إرسال</button>';
      const issues = checkFormAccessibility(html);
      const genericIssue = issues.find((i) => i.id === 'submit-button-generic-0');
      expect(genericIssue).toBeDefined();
    });
  });

  describe('checkAria', () => {
    it('should detect aria-hidden with focusable content', () => {
      const html = '<div aria-hidden="true"><button>Click me</button></div>';
      const issues = checkAria(html);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].category).toBe('aria');
      expect(issues[0].severity).toBe('serious');
    });

    it('should detect invalid ARIA roles', () => {
      const html = '<div role="header">Title</div>';
      const issues = checkAria(html);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].description).toContain('header');
    });

    it('should accept valid ARIA roles', () => {
      const html = '<div role="banner">Title</div>';
      const issues = checkAria(html);
      const invalidRoleIssue = issues.find((i) => i.id === 'invalid-role-0');
      expect(invalidRoleIssue).toBeUndefined();
    });
  });

  describe('checkLinks', () => {
    it('should detect empty links', () => {
      const html = '<a href="/about"></a>';
      const issues = checkLinks(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].category).toBe('links');
      expect(issues[0].severity).toBe('serious');
    });

    it('should detect generic link text', () => {
      const html = '<a href="/page">click here</a>';
      const issues = checkLinks(html);
      const genericIssue = issues.find((i) => i.id.startsWith('generic-link'));
      expect(genericIssue).toBeDefined();
    });

    it('should detect Arabic generic link text', () => {
      const html = '<a href="/page">اضغط هنا</a>';
      const issues = checkLinks(html);
      const genericIssue = issues.find((i) => i.id.startsWith('generic-link'));
      expect(genericIssue).toBeDefined();
    });

    it('should detect URLs as link text', () => {
      const html = '<a href="https://example.com">https://example.com</a>';
      const issues = checkLinks(html);
      const urlIssue = issues.find((i) => i.id.startsWith('url-link'));
      expect(urlIssue).toBeDefined();
    });

    it('should accept descriptive link text', () => {
      const html = '<a href="/documentation">Read the documentation</a>';
      const issues = checkLinks(html);
      expect(issues).toHaveLength(0);
    });
  });

  describe('checkTables', () => {
    it('should detect tables without headers', () => {
      const html = '<table><tr><td>Name</td></tr></table>';
      const issues = checkTables(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].category).toBe('tables');
      expect(issues[0].severity).toBe('serious');
    });

    it('should accept tables with headers', () => {
      const html = '<table><tr><th>Name</th></tr></table>';
      const issues = checkTables(html);
      const noHeadersIssue = issues.find((i) => i.id.includes('table-no-headers'));
      expect(noHeadersIssue).toBeUndefined();
    });

    it('should detect headers without scope', () => {
      const html = '<table><tr><th>Name</th></tr></table>';
      const issues = checkTables(html);
      const scopeIssue = issues.find((i) => i.id.includes('th-no-scope'));
      expect(scopeIssue).toBeDefined();
    });

    it('should accept headers with scope', () => {
      const html = '<table><tr><th scope="col">Name</th></tr></table>';
      const issues = checkTables(html);
      const scopeIssue = issues.find((i) => i.id.includes('th-no-scope'));
      expect(scopeIssue).toBeUndefined();
    });

    it('should detect missing caption', () => {
      const html = '<table><tr><th scope="col">Name</th></tr></table>';
      const issues = checkTables(html);
      const captionIssue = issues.find((i) => i.id.includes('table-no-caption'));
      expect(captionIssue).toBeDefined();
    });
  });

  describe('checkLists', () => {
    it('should detect content outside list items', () => {
      const html = '<ul><li>Item 1</li>Item 2</ul>';
      const issues = checkLists(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].category).toBe('lists');
    });

    it('should accept properly structured lists', () => {
      const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
      const issues = checkLists(html);
      expect(issues).toHaveLength(0);
    });
  });

  describe('checkCodeBlocks', () => {
    it('should detect code blocks without language', () => {
      const html = '<pre><code>const x = 5;</code></pre>';
      const issues = checkCodeBlocks(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].category).toBe('code_blocks');
    });

    it('should accept code blocks with language', () => {
      const html = '<pre><code class="language-javascript">const x = 5;</code></pre>';
      const issues = checkCodeBlocks(html);
      expect(issues).toHaveLength(0);
    });
  });

  describe('checkFocusManagement', () => {
    it('should detect positive tabindex', () => {
      const html = '<div tabindex="5">Content</div>';
      const issues = checkFocusManagement(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].category).toBe('focus_management');
      expect(issues[0].severity).toBe('serious');
    });

    it('should accept tabindex="0"', () => {
      const html = '<div tabindex="0">Content</div>';
      const issues = checkFocusManagement(html);
      expect(issues).toHaveLength(0);
    });

    it('should accept tabindex="-1"', () => {
      const html = '<div tabindex="-1">Content</div>';
      const issues = checkFocusManagement(html);
      expect(issues).toHaveLength(0);
    });
  });

  describe('checkLanguage', () => {
    it('should detect missing lang attribute on html', () => {
      const html = '<html><head><title>Test</title></head></html>';
      const issues = checkLanguage(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].category).toBe('language');
      expect(issues[0].severity).toBe('critical');
    });

    it('should accept html with lang attribute', () => {
      const html = '<html lang="en"><head></head></html>';
      const issues = checkLanguage(html);
      const noLangIssue = issues.find((i) => i.id === 'no-lang-attribute');
      expect(noLangIssue).toBeUndefined();
    });

    it('should detect multiple languages', () => {
      const html = '<html lang="en"><p>English <span lang="ar">العربية</span></p></html>';
      const issues = checkLanguage(html);
      const multiLangIssue = issues.find((i) => i.id === 'multiple-languages');
      expect(multiLangIssue).toBeDefined();
    });
  });

  describe('checkSkipLinks', () => {
    it('should detect missing skip link', () => {
      const html = '<nav>Navigation</nav><main>Content</main>';
      const issues = checkSkipLinks(html);
      expect(issues).toHaveLength(1);
      expect(issues[0].category).toBe('keyboard');
    });

    it('should accept skip navigation link', () => {
      const html = '<a href="#main" class="skip">Skip to main</a><nav>Navigation</nav>';
      const issues = checkSkipLinks(html);
      expect(issues).toHaveLength(0);
    });
  });
});

describe('Comprehensive Audit', () => {
  describe('runAccessibilityAudit', () => {
    it('should run all checks and return complete audit', () => {
      const html = `
        <html lang="en">
        <img src="test.png">
        <h2>Title</h2>
        <h4>Subtitle</h4>
        <input type="text" name="test">
        </html>
      `;
      const audit = runAccessibilityAudit(html);
      expect(audit.overallScore).toBeLessThan(100);
      expect(audit.totalIssues).toBeGreaterThan(0);
      expect(audit.criticalIssues).toBeGreaterThan(0);
      expect(audit.issues).toBeDefined();
      expect(audit.summary).toBeDefined();
      expect(audit.recommendations).toBeDefined();
    });

    it('should return score of 100 for perfect content', () => {
      const html = '<html lang="en"><h1>Title</h1><p>Content</p><img src="test.png" alt="Test"></html>';
      const audit = runAccessibilityAudit(html);
      expect(audit.overallScore).toBe(100);
      expect(audit.wcagLevel).not.toBe('FAIL');
    });

    it('should calculate correct score based on severity', () => {
      const html = `
        <html>
        <img src="a.png">
        <img src="b.png">
        <h2>Title</h2>
        <h4>Subtitle</h4>
        </html>
      `;
      const audit = runAccessibilityAudit(html);
      // Should have 2 critical (images) = 50 points deducted
      // 1 moderate (heading skip) = 2 points deducted
      // Expected score: 100 - 50 - 2 = 48
      expect(audit.overallScore).toBe(48);
    });

    it('should determine WCAG level based on issues', () => {
      const failHtml = '<html><img src="test.png"></html>';
      const failAudit = runAccessibilityAudit(failHtml);
      expect(failAudit.wcagLevel).toBe('FAIL');

      const passHtml = '<html lang="en"><h1>Title</h1></html>';
      const passAudit = runAccessibilityAudit(passHtml);
      expect(passAudit.wcagLevel).not.toBe('FAIL');
    });

    it('should generate recommendations', () => {
      const html = '<html><img src="a.png"><img src="b.png"></html>';
      const audit = runAccessibilityAudit(html);
      expect(audit.recommendations.length).toBeGreaterThan(0);
      const imageRec = audit.recommendations.find((r) => r.includes('alt text'));
      expect(imageRec).toBeDefined();
    });

    it('should filter by WCAG level option', () => {
      const html = '<html><input type="text" name="test"></html>';
      const audit = runAccessibilityAudit(html, { wcagLevel: 'A' });
      // Input without label is WCAG A, so should be included
      const formIssues = audit.issues.filter((i) => i.category === 'forms');
      expect(formIssues.length).toBeGreaterThan(0);
    });
  });

  describe('auditMultipleArticles', () => {
    it('should audit multiple articles and return map', () => {
      const articles = [
        { slug: 'article1', title: 'Article 1', content: '<html lang="en"><h1>Title</h1></html>' },
        { slug: 'article2', title: 'Article 2', content: '<html><img src="test.png"></html>' },
      ];
      const results = auditMultipleArticles(articles);
      expect(results.size).toBe(2);
      expect(results.has('article1')).toBe(true);
      expect(results.has('article2')).toBe(true);
    });
  });

  describe('getFailingArticles', () => {
    it('should return articles with score below threshold', () => {
      const audits = new Map<string, AccessibilityAudit>();
      audits.set('good', {
        timestamp: new Date(),
        overallScore: 95,
        wcagLevel: 'AA',
        totalIssues: 0,
        criticalIssues: 0,
        seriousIssues: 0,
        moderateIssues: 0,
        minorIssues: 0,
        issues: [],
        summary: { passedChecks: 0, failedChecks: 0, percentageCompliant: 95 },
        recommendations: [],
      });
      audits.set('bad', {
        timestamp: new Date(),
        overallScore: 50,
        wcagLevel: 'FAIL',
        totalIssues: 2,
        criticalIssues: 2,
        seriousIssues: 0,
        moderateIssues: 0,
        minorIssues: 0,
        issues: [],
        summary: { passedChecks: 0, failedChecks: 2, percentageCompliant: 50 },
        recommendations: [],
      });

      const failing = getFailingArticles(audits, 80);
      expect(failing).toHaveLength(1);
      expect(failing[0].slug).toBe('bad');
    });

    it('should return articles with FAIL status', () => {
      const audits = new Map<string, AccessibilityAudit>();
      audits.set('fail', {
        timestamp: new Date(),
        overallScore: 85,
        wcagLevel: 'FAIL',
        totalIssues: 1,
        criticalIssues: 1,
        seriousIssues: 0,
        moderateIssues: 0,
        minorIssues: 0,
        issues: [],
        summary: { passedChecks: 0, failedChecks: 1, percentageCompliant: 85 },
        recommendations: [],
      });

      const failing = getFailingArticles(audits, 80);
      expect(failing).toHaveLength(1);
    });
  });

  describe('generateAccessibilityReport', () => {
    it('should generate markdown report', () => {
      const audits = new Map<string, AccessibilityAudit>();
      audits.set('article1', {
        timestamp: new Date(),
        overallScore: 95,
        wcagLevel: 'AA',
        totalIssues: 0,
        criticalIssues: 0,
        seriousIssues: 0,
        moderateIssues: 0,
        minorIssues: 0,
        issues: [],
        summary: { passedChecks: 0, failedChecks: 0, percentageCompliant: 95 },
        recommendations: [],
      });

      const report = generateAccessibilityReport(audits);
      expect(report).toContain('# Accessibility Audit Report');
      expect(report).toContain('Article 1');
      expect(report).toContain('95');
    });

    it('should include summary section', () => {
      const audits = new Map<string, AccessibilityAudit>();
      audits.set('test', {
        timestamp: new Date(),
        overallScore: 70,
        wcagLevel: 'A',
        totalIssues: 3,
        criticalIssues: 1,
        seriousIssues: 1,
        moderateIssues: 1,
        minorIssues: 0,
        issues: [],
        summary: { passedChecks: 0, failedChecks: 3, percentageCompliant: 70 },
        recommendations: [],
      });

      const report = generateAccessibilityReport(audits);
      expect(report).toContain('## Summary');
      expect(report).toContain('Articles Audited: 1');
      expect(report).toContain('Critical: 1');
    });
  });
});

describe('Validation', () => {
  describe('validateAccessibilityIssue', () => {
    it('should validate correct issue', () => {
      const issue: AccessibilityIssue = {
        id: 'test-1',
        category: 'images',
        severity: 'critical',
        standpoint: 'wcag_a',
        wcagCriteria: '1.1.1 Non-text Content',
        title: 'Test issue',
        description: 'Test description',
        impact: 'Test impact',
        suggestion: 'Test suggestion',
        autoFixable: false,
      };
      expect(validateAccessibilityIssue(issue)).toBe(true);
    });

    it('should reject issue missing required fields', () => {
      const issue = {
        id: 'test-1',
        category: 'images',
        severity: 'critical',
        standpoint: 'wcag_a',
      } as unknown as AccessibilityIssue;
      expect(validateAccessibilityIssue(issue)).toBe(false);
    });

    it('should reject invalid category', () => {
      const issue = {
        id: 'test-1',
        category: 'invalid' as unknown as 'images',
        severity: 'critical',
        standpoint: 'wcag_a',
        wcagCriteria: '1.1.1',
        title: 'Test',
        description: 'Test',
        impact: 'Test',
        suggestion: 'Test',
        autoFixable: false,
      };
      expect(validateAccessibilityIssue(issue)).toBe(false);
    });

    it('should reject invalid severity', () => {
      const issue = {
        id: 'test-1',
        category: 'images',
        severity: 'invalid' as unknown as 'critical',
        standpoint: 'wcag_a',
        wcagCriteria: '1.1.1',
        title: 'Test',
        description: 'Test',
        impact: 'Test',
        suggestion: 'Test',
        autoFixable: false,
      };
      expect(validateAccessibilityIssue(issue)).toBe(false);
    });
  });

  describe('validateAccessibilityAudit', () => {
    it('should validate correct audit', () => {
      const audit: AccessibilityAudit = {
        timestamp: new Date(),
        overallScore: 85,
        wcagLevel: 'AA',
        totalIssues: 1,
        criticalIssues: 0,
        seriousIssues: 1,
        moderateIssues: 0,
        minorIssues: 0,
        issues: [
          {
            id: 'test-1',
            category: 'images',
            severity: 'serious',
            standpoint: 'wcag_aa',
            wcagCriteria: '1.1.1',
            title: 'Test',
            description: 'Test',
            impact: 'Test',
            suggestion: 'Test',
            autoFixable: false,
          },
        ],
        summary: {
          passedChecks: 10,
          failedChecks: 1,
          percentageCompliant: 85,
        },
        recommendations: ['Test recommendation'],
      };
      expect(validateAccessibilityAudit(audit)).toBe(true);
    });

    it('should reject audit with invalid score', () => {
      const audit = {
        timestamp: new Date(),
        overallScore: 150,
        wcagLevel: 'AA' as const,
        totalIssues: 0,
        criticalIssues: 0,
        seriousIssues: 0,
        moderateIssues: 0,
        minorIssues: 0,
        issues: [],
        summary: { passedChecks: 0, failedChecks: 0, percentageCompliant: 150 },
        recommendations: [],
      };
      expect(validateAccessibilityAudit(audit)).toBe(false);
    });

    it('should reject audit with invalid WCAG level', () => {
      const audit = {
        timestamp: new Date(),
        overallScore: 85,
        wcagLevel: 'INVALID' as unknown as 'AA',
        totalIssues: 0,
        criticalIssues: 0,
        seriousIssues: 0,
        moderateIssues: 0,
        minorIssues: 0,
        issues: [],
        summary: { passedChecks: 0, failedChecks: 0, percentageCompliant: 85 },
        recommendations: [],
      };
      expect(validateAccessibilityAudit(audit)).toBe(false);
    });
  });

  describe('createAccessibilityIssue', () => {
    it('should create valid issue', () => {
      const issue = createAccessibilityIssue(
        'test-1',
        'images',
        'critical',
        'wcag_a',
        '1.1.1',
        'Test issue',
        'Test description',
        'Test impact',
        'Test suggestion',
        false
      );
      expect(validateAccessibilityIssue(issue)).toBe(true);
      expect(issue.id).toBe('test-1');
      expect(issue.category).toBe('images');
    });

    it('should create issue with code example', () => {
      const issue = createAccessibilityIssue(
        'test-1',
        'images',
        'critical',
        'wcag_a',
        '1.1.1',
        'Test issue',
        'Test description',
        'Test impact',
        'Test suggestion',
        false,
        { bad: '<img src="test">', good: '<img src="test" alt="Test">' }
      );
      expect(issue.codeExample).toBeDefined();
      expect(issue.codeExample?.bad).toBe('<img src="test">');
    });
  });
});

describe('Edge Cases', () => {
  it('should handle empty HTML', () => {
    const audit = runAccessibilityAudit('');
    expect(audit.overallScore).toBeLessThan(100);
    // Should detect missing lang attribute if html tag is checked
  });

  it('should handle HTML with only whitespace', () => {
    const audit = runAccessibilityAudit('   \n  \t  ');
    expect(audit).toBeDefined();
  });

  it('should handle very large HTML documents', () => {
    let html = '<html lang="en">';
    for (let i = 0; i < 100; i++) {
      html += `<h${(i % 6) + 1}>Heading ${i}</h${(i % 6) + 1}>`;
    }
    html += '</html>';
    const audit = runAccessibilityAudit(html);
    expect(audit).toBeDefined();
    expect(audit.totalIssues).toBeGreaterThan(0);
  });

  it('should handle special characters in content', () => {
    const html = '<html lang="en"><p>Test &amp; test &lt;tag&gt; "quotes"</p></html>';
    const audit = runAccessibilityAudit(html);
    expect(audit).toBeDefined();
  });

  it('should handle Arabic RTL content', () => {
    const html = '<html lang="ar" dir="rtl"><h1>عنوان</h1><p>محتوى عربي</p></html>';
    const audit = runAccessibilityAudit(html);
    expect(audit).toBeDefined();
    expect(audit.overallScore).toBeGreaterThanOrEqual(80);
  });

  it('should handle mixed language content', () => {
    const html = '<html lang="en"><p>English <span lang="ar">عربي</span> text</p></html>';
    const audit = runAccessibilityAudit(html);
    const multiLangIssue = audit.issues.find((i) => i.id === 'multiple-languages');
    expect(multiLangIssue).toBeDefined();
  });
});
