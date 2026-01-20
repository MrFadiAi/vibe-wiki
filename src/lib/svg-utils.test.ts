/**
 * Tests for SVG Utilities
 */

import { describe, it, expect } from 'vitest';
import {
  validateSVGDiagram,
  createSVGDiagram,
  validateSVGFilename,
  parseSVGFilename,
  getSVGPath,
  createAccessibleSVG,
  getFoundationalSVGs,
  checkFoundationalSVGs,
  generateInlineSVG,
  optimizeSVGContent,
  getSVGDimensions,
  validateSVGAccessibility,
  getResponsiveSVGClass,
  type SVGDiagram,
} from './svg-utils';

describe('svg-utils', () => {
  describe('validateSVGDiagram', () => {
    it('should validate a correct SVG diagram object', () => {
      const validDiagram: SVGDiagram = {
        src: '/images/diagrams/test.svg',
        alt: 'Test diagram',
      };
      expect(validateSVGDiagram(validDiagram)).toBe(true);
    });

    it('should validate SVG diagram with all optional fields', () => {
      const fullDiagram: SVGDiagram = {
        src: '/images/diagrams/test.svg',
        alt: 'Test diagram',
        caption: 'A test caption',
        maxWidth: '3xl',
        title: 'Test Title',
        description: 'Test description',
      };
      expect(validateSVGDiagram(fullDiagram)).toBe(true);
    });

    it('should reject non-object values', () => {
      expect(validateSVGDiagram(null)).toBe(false);
      expect(validateSVGDiagram(undefined)).toBe(false);
      expect(validateSVGDiagram('string')).toBe(false);
      expect(validateSVGDiagram(123)).toBe(false);
    });

    it('should reject objects missing required fields', () => {
      expect(validateSVGDiagram({})).toBe(false);
      expect(validateSVGDiagram({ src: '/test.svg' })).toBe(false);
      expect(validateSVGDiagram({ alt: 'test' })).toBe(false);
    });

    it('should reject objects with invalid field types', () => {
      expect(validateSVGDiagram({ src: 123, alt: 'test' } as unknown as SVGDiagram)).toBe(false);
      expect(validateSVGDiagram({ src: '/test.svg', alt: 123 } as unknown as SVGDiagram)).toBe(false);
      expect(validateSVGDiagram({ src: '/test.svg', alt: 'test', caption: 123 } as unknown as SVGDiagram)).toBe(false);
    });

    it('should reject empty strings for required fields', () => {
      expect(validateSVGDiagram({ src: '', alt: 'test' })).toBe(false);
      expect(validateSVGDiagram({ src: '/test.svg', alt: '' })).toBe(false);
      expect(validateSVGDiagram({ src: '   ', alt: 'test' })).toBe(false);
    });
  });

  describe('createSVGDiagram', () => {
    it('should create a minimal SVG diagram', () => {
      const diagram = createSVGDiagram('/test.svg', 'Test alt');
      expect(diagram).toEqual({
        src: '/test.svg',
        alt: 'Test alt',
      });
    });

    it('should trim whitespace from src and alt', () => {
      const diagram = createSVGDiagram('  /test.svg  ', '  Test alt  ');
      expect(diagram.src).toBe('/test.svg');
      expect(diagram.alt).toBe('Test alt');
    });

    it('should create SVG diagram with caption', () => {
      const diagram = createSVGDiagram('/test.svg', 'Test alt', {
        caption: 'A caption',
      });
      expect(diagram.caption).toBe('A caption');
    });

    it('should create SVG diagram with maxWidth', () => {
      const diagram = createSVGDiagram('/test.svg', 'Test alt', {
        maxWidth: '2xl',
      });
      expect(diagram.maxWidth).toBe('2xl');
    });

    it('should create SVG diagram with title', () => {
      const diagram = createSVGDiagram('/test.svg', 'Test alt', {
        title: 'Test Title',
      });
      expect(diagram.title).toBe('Test Title');
    });

    it('should create SVG diagram with description', () => {
      const diagram = createSVGDiagram('/test.svg', 'Test alt', {
        description: 'Test description',
      });
      expect(diagram.description).toBe('Test description');
    });

    it('should create SVG diagram with all options', () => {
      const diagram = createSVGDiagram('/test.svg', 'Test alt', {
        caption: 'A caption',
        maxWidth: '3xl',
        title: 'Title',
        description: 'Description',
      });
      expect(diagram).toEqual({
        src: '/test.svg',
        alt: 'Test alt',
        caption: 'A caption',
        maxWidth: '3xl',
        title: 'Title',
        description: 'Description',
      });
    });

    it('should throw error for invalid diagram', () => {
      expect(() => createSVGDiagram('', 'Test alt')).toThrow();
    });
  });

  describe('validateSVGFilename', () => {
    it('should validate correct SVG filenames', () => {
      expect(validateSVGFilename('test.svg')).toBe(true);
      expect(validateSVGFilename('getting-started-timeline-flow.svg')).toBe(true);
      expect(validateSVGFilename('cli-claude-terminal-flow.svg')).toBe(true);
      expect(validateSVGFilename('workflow-vibecoding.svg')).toBe(true);
    });

    it('should reject filenames with uppercase letters', () => {
      expect(validateSVGFilename('Test.svg')).toBe(false);
      expect(validateSVGFilename('TEST.svg')).toBe(false);
      expect(validateSVGFilename('getting-Started-Timeline.svg')).toBe(false);
    });

    it('should reject filenames with invalid characters', () => {
      expect(validateSVGFilename('test_file.svg')).toBe(false);
      expect(validateSVGFilename('test file.svg')).toBe(false);
      expect(validateSVGFilename('test.file.svg')).toBe(false);
      expect(validateSVGFilename('test@file.svg')).toBe(false);
    });

    it('should reject filenames without .svg extension', () => {
      expect(validateSVGFilename('test.png')).toBe(false);
      expect(validateSVGFilename('test.jpg')).toBe(false);
      expect(validateSVGFilename('test')).toBe(false);
      expect(validateSVGFilename('test.sv')).toBe(false);
    });

    it('should reject empty filenames', () => {
      expect(validateSVGFilename('')).toBe(false);
      expect(validateSVGFilename('.svg')).toBe(false);
    });

    it('should reject filenames starting with hyphen', () => {
      expect(validateSVGFilename('-test.svg')).toBe(false);
      expect(validateSVGFilename('--test.svg')).toBe(false);
    });

    it('should reject filenames ending with hyphen', () => {
      expect(validateSVGFilename('test-.svg')).toBe(false);
      expect(validateSVGFilename('test--.svg')).toBe(false);
    });

    it('should accept single-word filenames', () => {
      expect(validateSVGFilename('test.svg')).toBe(true);
      expect(validateSVGFilename('diagram.svg')).toBe(true);
    });

    it('should accept filenames with numbers', () => {
      expect(validateSVGFilename('test123.svg')).toBe(true);
      expect(validateSVGFilename('test-123.svg')).toBe(true);
      expect(validateSVGFilename('123-test.svg')).toBe(true);
    });
  });

  describe('parseSVGFilename', () => {
    it('should parse getting-started SVGs', () => {
      const result = parseSVGFilename('getting-started-timeline-flow.svg');
      expect(result).toEqual({
        filename: 'getting-started-timeline-flow.svg',
        title: 'Getting Started Timeline Flow',
        description: 'SVG diagram: getting-started-timeline-flow',
        category: 'getting-started',
      });
    });

    it('should parse cli-overview SVGs', () => {
      const result = parseSVGFilename('cli-overview-architecture.svg');
      expect(result).toEqual({
        filename: 'cli-overview-architecture.svg',
        title: 'Cli Overview Architecture',
        description: 'SVG diagram: cli-overview-architecture',
        category: 'cli-overview',
      });
    });

    it('should parse cli-claude SVGs', () => {
      const result = parseSVGFilename('cli-claude-terminal-flow.svg');
      expect(result).toEqual({
        filename: 'cli-claude-terminal-flow.svg',
        title: 'Cli Claude Terminal Flow',
        description: 'SVG diagram: cli-claude-terminal-flow',
        category: 'claude-cli',
      });
    });

    it('should parse cli-copilot SVGs', () => {
      const result = parseSVGFilename('cli-copilot-workflow.svg');
      expect(result).toEqual({
        filename: 'cli-copilot-workflow.svg',
        title: 'Cli Copilot Workflow',
        description: 'SVG diagram: cli-copilot-workflow',
        category: 'copilot-cli',
      });
    });

    it('should parse cli-opencode SVGs', () => {
      const result = parseSVGFilename('cli-opencode-architecture.svg');
      expect(result).toEqual({
        filename: 'cli-opencode-architecture.svg',
        title: 'Cli Opencode Architecture',
        description: 'SVG diagram: cli-opencode-architecture',
        category: 'opencode',
      });
    });

    it('should parse comparison SVGs', () => {
      const result = parseSVGFilename('comparison-decision-tree.svg');
      expect(result).toEqual({
        filename: 'comparison-decision-tree.svg',
        title: 'Comparison Decision Tree',
        description: 'SVG diagram: comparison-decision-tree',
        category: 'comparison',
      });
    });

    it('should parse workflow SVGs', () => {
      const result = parseSVGFilename('workflow-vibecoding.svg');
      expect(result).toEqual({
        filename: 'workflow-vibecoding.svg',
        title: 'Workflow Vibecoding',
        description: 'SVG diagram: workflow-vibecoding',
        category: 'workflow',
      });
    });

    it('should return null for invalid filenames', () => {
      expect(parseSVGFilename('Test.svg')).toBeNull();
      expect(parseSVGFilename('test.png')).toBeNull();
      expect(parseSVGFilename('')).toBeNull();
      expect(parseSVGFilename('unknown-category-test.svg')).toBeNull();
    });

    it('should handle multi-part filenames', () => {
      const result = parseSVGFilename('getting-started-ai-workflow-diagram.svg');
      expect(result?.title).toBe('Getting Started Ai Workflow Diagram');
    });
  });

  describe('getSVGPath', () => {
    it('should return correct path for valid filename', () => {
      expect(getSVGPath('test.svg')).toBe('/images/diagrams/test.svg');
      expect(getSVGPath('getting-started-timeline-flow.svg')).toBe('/images/diagrams/getting-started-timeline-flow.svg');
    });

    it('should throw error for invalid filename', () => {
      expect(() => getSVGPath('Test.svg')).toThrow();
      expect(() => getSVGPath('test.png')).toThrow();
      expect(() => getSVGPath('')).toThrow();
    });
  });

  describe('createAccessibleSVG', () => {
    it('should create accessible SVG with metadata', () => {
      const result = createAccessibleSVG('getting-started-timeline-flow.svg', 'Timeline flow');
      expect(result).toEqual({
        src: '/images/diagrams/getting-started-timeline-flow.svg',
        alt: 'Timeline flow',
        title: 'Getting Started Timeline Flow',
        description: 'SVG diagram: getting-started-timeline-flow',
      });
    });

    it('should use custom description when provided', () => {
      const result = createAccessibleSVG('test.svg', 'Alt text', {
        description: 'Custom description',
      });
      expect(result.description).toBe('Custom description');
    });

    it('should include caption when provided', () => {
      const result = createAccessibleSVG('test.svg', 'Alt text', {
        caption: 'A caption',
      });
      expect(result.caption).toBe('A caption');
    });

    it('should include maxWidth when provided', () => {
      const result = createAccessibleSVG('test.svg', 'Alt text', {
        maxWidth: '2xl',
      });
      expect(result.maxWidth).toBe('2xl');
    });

    it('should throw error for invalid filename', () => {
      expect(() => createAccessibleSVG('Test.svg', 'Alt')).toThrow();
    });
  });

  describe('getFoundationalSVGs', () => {
    it('should return all 10 foundational SVGs', () => {
      const svgList = getFoundationalSVGs();
      expect(svgList).toHaveLength(10);
    });

    it('should include getting-started SVGs', () => {
      const svgList = getFoundationalSVGs();
      expect(svgList).toContain('getting-started-timeline-flow.svg');
      expect(svgList).toContain('getting-started-decision-tree.svg');
      expect(svgList).toContain('getting-started-installation-flow.svg');
      expect(svgList).toContain('getting-started-ai-workflow.svg');
      expect(svgList).toContain('getting-started-learning-paths.svg');
    });

    it('should include cli-overview SVGs', () => {
      const svgList = getFoundationalSVGs();
      expect(svgList).toContain('cli-overview-architecture.svg');
      expect(svgList).toContain('cli-overview-ecosystem-landscape.svg');
      expect(svgList).toContain('cli-overview-comparison-matrix.svg');
    });

    it('should include first 2 claude-cli SVGs', () => {
      const svgList = getFoundationalSVGs();
      expect(svgList).toContain('cli-claude-terminal-flow.svg');
      expect(svgList).toContain('cli-claude-installation-checklist.svg');
    });
  });

  describe('checkFoundationalSVGs', () => {
    it('should return complete status when all SVGs exist', () => {
      const allSVGs = getFoundationalSVGs();
      const result = checkFoundationalSVGs(allSVGs);
      expect(result.complete).toBe(true);
      expect(result.missing).toHaveLength(0);
      expect(result.present).toHaveLength(10);
    });

    it('should return incomplete status when SVGs are missing', () => {
      const result = checkFoundationalSVGs(['getting-started-timeline-flow.svg']);
      expect(result.complete).toBe(false);
      expect(result.missing).toHaveLength(9);
      expect(result.present).toHaveLength(1);
    });

    it('should return incomplete status for empty list', () => {
      const result = checkFoundationalSVGs([]);
      expect(result.complete).toBe(false);
      expect(result.missing).toHaveLength(10);
      expect(result.present).toHaveLength(0);
    });

    it('should identify missing SVGs correctly', () => {
      const result = checkFoundationalSVGs(['getting-started-timeline-flow.svg', 'cli-overview-architecture.svg']);
      expect(result.missing).toContain('getting-started-decision-tree.svg');
      expect(result.missing).not.toContain('getting-started-timeline-flow.svg');
    });
  });

  describe('generateInlineSVG', () => {
    it('should add className to SVG', () => {
      const svg = '<svg viewBox="0 0 100 100"></svg>';
      const result = generateInlineSVG(svg, { className: 'test-class' });
      expect(result).toContain('class="test-class"');
    });

    it('should add width and height to SVG', () => {
      const svg = '<svg viewBox="0 0 100 100"></svg>';
      const result = generateInlineSVG(svg, { width: '100%', height: 'auto' });
      expect(result).toContain('width="100%"');
      expect(result).toContain('height="auto"');
    });

    it('should add title element to SVG', () => {
      const svg = '<svg viewBox="0 0 100 100"></svg>';
      const result = generateInlineSVG(svg, { title: 'Test Title' });
      expect(result).toContain('<title>Test Title</title>');
    });

    it('should add desc element to SVG', () => {
      const svg = '<svg viewBox="0 0 100 100"></svg>';
      const result = generateInlineSVG(svg, { description: 'Test description' });
      expect(result).toContain('<desc>Test description</desc>');
    });

    it('should add both title and desc elements', () => {
      const svg = '<svg viewBox="0 0 100 100"></svg>';
      const result = generateInlineSVG(svg, {
        title: 'Title',
        description: 'Description',
      });
      expect(result).toContain('<title>Title</title>');
      expect(result).toContain('<desc>Description</desc>');
    });

    it('should preserve existing SVG content', () => {
      const svg = '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>';
      const result = generateInlineSVG(svg, { title: 'Test' });
      expect(result).toContain('<circle cx="50" cy="50" r="40"/>');
    });

    it('should handle SVG with existing attributes', () => {
      const svg = '<svg class="existing" viewBox="0 0 100 100"></svg>';
      const result = generateInlineSVG(svg, { className: 'new-class' });
      // Should add new class attribute
      expect(result).toContain('class="new-class"');
    });
  });

  describe('optimizeSVGContent', () => {
    it('should remove comments', () => {
      const svg = '<svg><!-- This is a comment --><rect/></svg>';
      const result = optimizeSVGContent(svg);
      expect(result).not.toContain('<!--');
    });

    it('should collapse whitespace', () => {
      const svg = '<svg   >  <rect   /></svg  >';
      const result = optimizeSVGContent(svg);
      expect(result).toBe('<svg> <rect /></svg>');
    });

    it('should remove whitespace between tags', () => {
      const svg = '<svg>\n  <rect/>\n</svg>';
      const result = optimizeSVGContent(svg);
      expect(result).toBe('<svg> <rect/> </svg>');
    });

    it('should trim result', () => {
      const svg = '  <svg></svg>  ';
      const result = optimizeSVGContent(svg);
      expect(result).toBe('<svg></svg>');
    });

    it('should handle complex SVG', () => {
      const svg = `
        <svg viewBox="0 0 100 100">
          <!-- Background -->
          <rect width="100" height="100" fill="white"/>
          <!-- Circle -->
          <circle cx="50" cy="50" r="40"/>
        </svg>
      `;
      const result = optimizeSVGContent(svg);
      expect(result).not.toContain('<!--');
      expect(result).toContain('<svg');
      expect(result).toContain('</svg>');
    });
  });

  describe('getSVGDimensions', () => {
    it('should extract explicit width and height', () => {
      const svg = '<svg width="800" height="600" viewBox="0 0 800 600"></svg>';
      const result = getSVGDimensions(svg);
      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('should use viewBox as fallback', () => {
      const svg = '<svg viewBox="0 0 1000 500"></svg>';
      const result = getSVGDimensions(svg);
      expect(result).toEqual({ width: 1000, height: 500 });
    });

    it('should use viewBox for missing dimension', () => {
      const svg = '<svg width="800" viewBox="0 0 800 600"></svg>';
      const result = getSVGDimensions(svg);
      expect(result).toEqual({ width: 800, height: 600 });
    });

    it('should return null for dimensions not found', () => {
      const svg = '<svg></svg>';
      const result = getSVGDimensions(svg);
      expect(result).toEqual({ width: null, height: null });
    });

    it('should handle viewBox with different spacing', () => {
      const svg = '<svg viewBox="0 0 100 200"></svg>';
      const result = getSVGDimensions(svg);
      expect(result).toEqual({ width: 100, height: 200 });
    });
  });

  describe('validateSVGAccessibility', () => {
    it('should validate SVG with title', () => {
      const svg = '<svg><title>Test Title</title></svg>';
      const result = validateSVGAccessibility(svg);
      expect(result.valid).toBe(true);
      expect(result.hasTitle).toBe(true);
    });

    it('should validate SVG with aria-label and role', () => {
      const svg = '<svg aria-label="Test" role="img"></svg>';
      const result = validateSVGAccessibility(svg);
      expect(result.valid).toBe(true);
      expect(result.hasAriaLabel).toBe(true);
      expect(result.hasRole).toBe(true);
    });

    it('should detect desc element', () => {
      const svg = '<svg><title>Test</title><desc>Description</desc></svg>';
      const result = validateSVGAccessibility(svg);
      expect(result.hasDesc).toBe(true);
    });

    it('should mark invalid SVG without accessibility features', () => {
      const svg = '<svg></svg>';
      const result = validateSVGAccessibility(svg);
      expect(result.valid).toBe(false);
      expect(result.hasTitle).toBe(false);
      expect(result.hasDesc).toBe(false);
      expect(result.hasRole).toBe(false);
      expect(result.hasAriaLabel).toBe(false);
    });

    it('should mark invalid SVG with only aria-label (no role)', () => {
      const svg = '<svg aria-label="Test"></svg>';
      const result = validateSVGAccessibility(svg);
      expect(result.valid).toBe(false);
      expect(result.hasAriaLabel).toBe(true);
      expect(result.hasRole).toBe(false);
    });

    it('should detect role attribute', () => {
      const svg = '<svg role="img"><title>Test</title></svg>';
      const result = validateSVGAccessibility(svg);
      expect(result.hasRole).toBe(true);
    });
  });

  describe('getResponsiveSVGClass', () => {
    it('should return base classes without maxWidth', () => {
      const result = getResponsiveSVGClass();
      expect(result).toBe('svg-diagram responsive mx-auto');
    });

    it('should add maxWidth class when provided', () => {
      const result = getResponsiveSVGClass('2xl');
      expect(result).toContain('max-w-2xl');
      expect(result).toContain('svg-diagram');
    });

    it('should handle full maxWidth', () => {
      const result = getResponsiveSVGClass('full');
      expect(result).toContain('max-w-full');
    });
  });
});
