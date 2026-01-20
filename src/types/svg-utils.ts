/**
 * SVG Utility Types
 * Type definitions for SVG diagram management
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
