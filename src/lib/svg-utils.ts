/**
 * SVG Utilities for Vibe Wiki
 * Utilities for managing, validating, and optimizing SVG diagram assets
 */

export interface SVGDiagram {
  src: string;
  alt: string;
  caption?: string;
  maxWidth?: string;
  title?: string;
  description?: string;
}

export interface SVGMetadata {
  filename: string;
  title: string;
  description: string;
  category: 'getting-started' | 'cli-overview' | 'claude-cli' | 'copilot-cli' | 'opencode' | 'comparison' | 'workflow';
  size?: number;
  width?: number;
  height?: number;
}

/**
 * Validates an SVG diagram object
 */
export function validateSVGDiagram(diagram: unknown): diagram is SVGDiagram {
  if (typeof diagram !== 'object' || diagram === null) {
    return false;
  }

  const d = diagram as Record<string, unknown>;

  return (
    typeof d.src === 'string' &&
    d.src.length > 0 &&
    typeof d.alt === 'string' &&
    d.alt.length > 0 &&
    (d.caption === undefined || typeof d.caption === 'string') &&
    (d.maxWidth === undefined || typeof d.maxWidth === 'string') &&
    (d.title === undefined || typeof d.title === 'string') &&
    (d.description === undefined || typeof d.description === 'string')
  );
}

/**
 * Creates an SVG diagram object with validation
 */
export function createSVGDiagram(
  src: string,
  alt: string,
  options?: {
    caption?: string;
    maxWidth?: string;
    title?: string;
    description?: string;
  }
): SVGDiagram {
  const diagram: SVGDiagram = {
    src: src.trim(),
    alt: alt.trim(),
  };

  if (options?.caption) {
    diagram.caption = options.caption.trim();
  }
  if (options?.maxWidth) {
    diagram.maxWidth = options.maxWidth;
  }
  if (options?.title) {
    diagram.title = options.title.trim();
  }
  if (options?.description) {
    diagram.description = options.description.trim();
  }

  if (!validateSVGDiagram(diagram)) {
    throw new Error('Invalid SVG diagram created');
  }

  return diagram;
}

/**
 * Validates an SVG filename format
 * Filenames should follow: {section}-{topic}-{type}.svg
 */
export function validateSVGFilename(filename: string): boolean {
  const pattern = /^[a-z0-9]+(-[a-z0-9]+)*\.svg$/;
  return pattern.test(filename);
}

/**
 * Extracts metadata from an SVG filename
 */
export function parseSVGFilename(filename: string): SVGMetadata | null {
  if (!validateSVGFilename(filename)) {
    return null;
  }

  const nameWithoutExt = filename.replace(/\.svg$/, '');
  const parts = nameWithoutExt.split('-');

  // Determine category from filename prefix
  let category: SVGMetadata['category'];
  if (nameWithoutExt.startsWith('getting-started-')) {
    category = 'getting-started';
  } else if (nameWithoutExt.startsWith('cli-overview-')) {
    category = 'cli-overview';
  } else if (nameWithoutExt.startsWith('cli-claude-')) {
    category = 'claude-cli';
  } else if (nameWithoutExt.startsWith('cli-copilot-')) {
    category = 'copilot-cli';
  } else if (nameWithoutExt.startsWith('cli-opencode-')) {
    category = 'opencode';
  } else if (nameWithoutExt.startsWith('comparison-')) {
    category = 'comparison';
  } else if (nameWithoutExt.startsWith('workflow-')) {
    category = 'workflow';
  } else {
    return null;
  }

  return {
    filename,
    title: parts
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' '),
    description: `SVG diagram: ${nameWithoutExt}`,
    category,
  };
}

/**
 * Gets the full path for an SVG asset
 */
export function getSVGPath(filename: string): string {
  if (!validateSVGFilename(filename)) {
    throw new Error(`Invalid SVG filename: ${filename}`);
  }
  return `/images/diagrams/${filename}`;
}

/**
 * Generates an accessible SVG object with title and description
 */
export function createAccessibleSVG(
  filename: string,
  alt: string,
  options?: {
    caption?: string;
    maxWidth?: string;
    description?: string;
  }
): SVGDiagram {
  const metadata = parseSVGFilename(filename);

  return createSVGDiagram(getSVGPath(filename), alt, {
    ...options,
    title: metadata?.title,
    description: options?.description ?? metadata?.description,
  });
}

/**
 * Lists all required foundational SVGs from PRD
 */
export function getFoundationalSVGs(): string[] {
  return [
    // Getting Started Section (5 SVGs)
    'getting-started-timeline-flow.svg',
    'getting-started-decision-tree.svg',
    'getting-started-installation-flow.svg',
    'getting-started-ai-workflow.svg',
    'getting-started-learning-paths.svg',
    // CLI Overview Section (3 SVGs)
    'cli-overview-architecture.svg',
    'cli-overview-ecosystem-landscape.svg',
    'cli-overview-comparison-matrix.svg',
    // First 2 from Claude CLI section
    'cli-claude-terminal-flow.svg',
    'cli-claude-installation-checklist.svg',
  ];
}

/**
 * Checks if all foundational SVGs exist
 * This is a utility for checking required assets
 */
export function checkFoundationalSVGs(existingFiles: string[]): {
  complete: boolean;
  missing: string[];
  present: string[];
} {
  const required = getFoundationalSVGs();
  const present = required.filter((file) => existingFiles.includes(file));
  const missing = required.filter((file) => !existingFiles.includes(file));

  return {
    complete: missing.length === 0,
    missing,
    present,
  };
}

/**
 * Generates SVG markup for inline usage
 */
export function generateInlineSVG(
  content: string,
  options?: {
    title?: string;
    description?: string;
    className?: string;
    width?: string;
    height?: string;
  }
): string {
  const attrs: string[] = [];

  if (options?.className) {
    attrs.push(`class="${options.className}"`);
  }
  if (options?.width) {
    attrs.push(`width="${options.width}"`);
  }
  if (options?.height) {
    attrs.push(`height="${options.height}"`);
  }

  const titleTag = options?.title ? `<title>${options.title}</title>` : '';
  const descTag = options?.description ? `<desc>${options.description}</desc>` : '';

  // Inject accessibility elements after the opening <svg> tag
  const accessibilityElements = [titleTag, descTag].filter(Boolean).join('\n  ');

  if (accessibilityElements) {
    return content.replace(
      /<svg([^>]*)>/,
      `<svg$1>\n  ${accessibilityElements}`
    );
  }

  return content;
}

/**
 * Optimizes SVG content for web usage
 * This is a simplified version - in production use SVGO
 */
export function optimizeSVGContent(svg: string): string {
  return svg
    .removeComments()
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim();
}

/**
 * Declares string extension for removeComments
 */
declare global {
  interface String {
    removeComments(): string;
  }
}

/**
 * Removes XML/HTML comments from a string
 */
String.prototype.removeComments = function (): string {
  return this.replace(/<!--[\s\S]*?-->/g, '');
};

/**
 * Gets SVG dimensions from content
 */
export function getSVGDimensions(svg: string): { width: number | null; height: number | null } {
  const widthMatch = svg.match(/width=["'](\d+)["']/);
  const heightMatch = svg.match(/height=["'](\d+)["']/);
  const viewBoxMatch = svg.match(/viewBox=["']0 0 (\d+) (\d+)["']/);

  const width = widthMatch ? parseInt(widthMatch[1], 10) : null;
  const height = heightMatch ? parseInt(heightMatch[1], 10) : null;

  // Fallback to viewBox if width/height not explicitly set
  if (viewBoxMatch && (!width || !height)) {
    const [, vbWidth, vbHeight] = viewBoxMatch;
    return {
      width: width ?? parseInt(vbWidth, 10),
      height: height ?? parseInt(vbHeight, 10),
    };
  }

  return { width, height };
}

/**
 * Validates SVG content for accessibility
 */
export function validateSVGAccessibility(svg: string): {
  valid: boolean;
  hasTitle: boolean;
  hasDesc: boolean;
  hasRole: boolean;
  hasAriaLabel: boolean;
} {
  const hasTitle = /<title>/i.test(svg);
  const hasDesc = /<desc>/i.test(svg);
  const hasRole = /role=["']img["']/i.test(svg);
  const hasAriaLabel = /aria-label=/i.test(svg);

  // SVG is accessible if it has at least title OR (aria-label OR role)
  const valid = hasTitle || (hasAriaLabel && hasRole);

  return {
    valid,
    hasTitle,
    hasDesc,
    hasRole,
    hasAriaLabel,
  };
}

/**
 * Generates a responsive SVG class name
 */
export function getResponsiveSVGClass(maxWidth?: string): string {
  const baseClasses = ['svg-diagram', 'responsive', 'mx-auto'];
  if (maxWidth) {
    baseClasses.push(`max-w-${maxWidth}`);
  }
  return baseClasses.join(' ');
}
