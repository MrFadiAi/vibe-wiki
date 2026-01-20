/**
 * Tests for SVGDiagram Component
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SVGDiagram, SVGDiagramGrid, SVGDiagramWithLink } from './SVGDiagram';
import type { SVGDiagram as SVGDiagramType } from '@/lib/svg-utils';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, className, title, priority }: {
    src: string;
    alt: string;
    className?: string;
    title?: string;
    priority?: boolean;
  }) => (
    <img
      src={src}
      alt={alt}
      className={className}
      title={title}
      data-priority={priority}
    />
  ),
}));

describe('SVGDiagram', () => {
  const mockDiagram: SVGDiagramType = {
    src: '/images/diagrams/test.svg',
    alt: 'Test diagram',
  };

  it('should render SVG diagram image', () => {
    render(<SVGDiagram diagram={mockDiagram} />);
    const img = screen.getByRole('img', { name: /Test diagram/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/diagrams/test.svg');
  });

  it('should render with default classes', () => {
    render(<SVGDiagram diagram={mockDiagram} />);
    const img = screen.getByRole('img');
    expect(img).toHaveClass('svg-diagram');
    expect(img).toHaveClass('w-full');
    expect(img).toHaveClass('h-auto');
    expect(img).toHaveClass('rounded-lg');
    expect(img).toHaveClass('shadow-lg');
  });

  it('should render caption when provided', () => {
    const diagramWithCaption: SVGDiagramType = {
      ...mockDiagram,
      caption: 'A test caption',
    };
    render(<SVGDiagram diagram={diagramWithCaption} />);
    const caption = screen.getByText('A test caption');
    expect(caption).toBeInTheDocument();
    expect(caption.tagName).toBe('FIGCAPTION');
  });

  it('should not render caption when not provided', () => {
    render(<SVGDiagram diagram={mockDiagram} />);
    const figcaption = screen.queryByTagName('FIGCAPTION');
    expect(figcaption).not.toBeInTheDocument();
  });

  it('should apply maxWidth class from diagram', () => {
    const diagramWithMaxWidth: SVGDiagramType = {
      ...mockDiagram,
      maxWidth: '2xl',
    };
    const { container } = render(<SVGDiagram diagram={diagramWithMaxWidth} />);
    const figure = container.querySelector('figure');
    expect(figure).toHaveClass('max-w-2xl');
  });

  it('should apply full width when maxWidth is "full"', () => {
    const diagramWithFullWidth: SVGDiagramType = {
      ...mockDiagram,
      maxWidth: 'full',
    };
    const { container } = render(<SVGDiagram diagram={diagramWithFullWidth} />);
    const figure = container.querySelector('figure');
    expect(figure).toHaveClass('w-full');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SVGDiagram diagram={mockDiagram} className="custom-class" />
    );
    const figure = container.querySelector('figure');
    expect(figure).toHaveClass('custom-class');
  });

  it('should render title attribute when provided', () => {
    const diagramWithTitle: SVGDiagramType = {
      ...mockDiagram,
      title: 'Test Title',
    };
    render(<SVGDiagram diagram={diagramWithTitle} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('title', 'Test Title');
  });

  it('should render screen reader description when provided', () => {
    const diagramWithDesc: SVGDiagramType = {
      ...mockDiagram,
      description: 'Screen reader description',
    };
    render(<SVGDiagram diagram={diagramWithDesc} />);
    const description = screen.getByText('Screen reader description');
    expect(description).toHaveClass('sr-only');
    expect(description).toHaveAttribute('id', '/images/diagrams/test.svg-desc');
  });

  it('should not render description when not provided', () => {
    render(<SVGDiagram diagram={mockDiagram} />);
    const description = screen.queryByText(/Screen reader/i);
    expect(description).not.toBeInTheDocument();
  });

  it('should render image with priority=false by default', () => {
    render(<SVGDiagram diagram={mockDiagram} />);
    const img = screen.getByRole('img');
    expect(img).toHaveAttribute('data-priority', 'false');
  });

  it('should wrap in figure element', () => {
    const { container } = render(<SVGDiagram diagram={mockDiagram} />);
    const figure = container.querySelector('figure');
    expect(figure).toBeInTheDocument();
    expect(figure).toHaveClass('svg-diagram-container');
  });
});

describe('SVGDiagramGrid', () => {
  const mockDiagrams: SVGDiagramType[] = [
    { src: '/images/diagrams/test1.svg', alt: 'Diagram 1' },
    { src: '/images/diagrams/test2.svg', alt: 'Diagram 2' },
    { src: '/images/diagrams/test3.svg', alt: 'Diagram 3' },
  ];

  it('should render all diagrams in grid', () => {
    render(<SVGDiagramGrid diagrams={mockDiagrams} />);
    expect(screen.getByRole('img', { name: /Diagram 1/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Diagram 2/i })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: /Diagram 3/i })).toBeInTheDocument();
  });

  it('should use default 2-column layout', () => {
    const { container } = render(<SVGDiagramGrid diagrams={mockDiagrams} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
  });

  it('should use 1-column layout when columns=1', () => {
    const { container } = render(
      <SVGDiagramGrid diagrams={mockDiagrams} columns={1} />
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).not.toHaveClass('md:grid-cols-2');
  });

  it('should use 3-column layout when columns=3', () => {
    const { container } = render(
      <SVGDiagramGrid diagrams={mockDiagrams} columns={3} />
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-3');
  });

  it('should use 4-column layout when columns=4', () => {
    const { container } = render(
      <SVGDiagramGrid diagrams={mockDiagrams} columns={4} />
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('md:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SVGDiagramGrid diagrams={mockDiagrams} className="custom-grid" />
    );
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('custom-grid');
  });

  it('should render empty grid when no diagrams provided', () => {
    const { container } = render(<SVGDiagramGrid diagrams={[]} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid?.children).toHaveLength(0);
  });

  it('should add gap between items', () => {
    const { container } = render(<SVGDiagramGrid diagrams={mockDiagrams} />);
    const grid = container.firstChild as HTMLElement;
    expect(grid).toHaveClass('gap-6');
  });
});

describe('SVGDiagramWithLink', () => {
  const mockDiagram: SVGDiagramType = {
    src: '/images/diagrams/test.svg',
    alt: 'Test diagram',
  };

  it('should render diagram wrapped in link', () => {
    render(<SVGDiagramWithLink diagram={mockDiagram} href="/full-size.svg" />);
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/full-size.svg');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should link to src when href not provided', () => {
    render(<SVGDiagramWithLink diagram={mockDiagram} />);
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/images/diagrams/test.svg');
  });

  it('should render image inside link', () => {
    render(<SVGDiagramWithLink diagram={mockDiagram} />);
    const link = screen.getByRole('link');
    const img = link.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/images/diagrams/test.svg');
  });

  it('should add hover scale effect to image', () => {
    render(<SVGDiagramWithLink diagram={mockDiagram} />);
    const img = screen.getByRole('img');
    expect(img).toHaveClass('hover:scale-[1.02]');
    expect(img).toHaveClass('transition-transform');
  });

  it('should show link in figcaption when href provided', () => {
    render(
      <SVGDiagramWithLink diagram={mockDiagram} href="/full.svg" linkTitle="View larger" />
    );
    const link = screen.getAllByRole('link')[1]; // Second link is in figcaption
    expect(link).toHaveTextContent('View larger');
    expect(link).toHaveAttribute('href', '/full.svg');
  });

  it('should show caption and link', () => {
    const diagramWithCaption: SVGDiagramType = {
      ...mockDiagram,
      caption: 'A caption',
    };
    render(<SVGDiagramWithLink diagram={diagramWithCaption} href="/full.svg" />);
    const figcaption = screen.getByText(/A caption/);
    expect(figcaption).toBeInTheDocument();
    const link = screen.getAllByRole('link')[1];
    expect(link).toHaveTextContent('View full-size');
  });

  it('should use default link title', () => {
    render(<SVGDiagramWithLink diagram={mockDiagram} href="/full.svg" />);
    const links = screen.getAllByRole('link');
    const captionLink = links[links.length - 1];
    expect(captionLink).toHaveTextContent('View full-size');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <SVGDiagramWithLink diagram={mockDiagram} className="custom-class" />
    );
    const figure = container.querySelector('figure');
    expect(figure).toHaveClass('custom-class');
  });

  it('should not show figcaption when no caption and no href', () => {
    render(<SVGDiagramWithLink diagram={mockDiagram} />);
    const figcaption = screen.queryByTagName('FIGCAPTION');
    expect(figcaption).not.toBeInTheDocument();
  });

  it('should show figcaption with link when href provided but no caption', () => {
    render(<SVGDiagramWithLink diagram={mockDiagram} href="/full.svg" />);
    const figcaption = screen.queryByTagName('FIGCAPTION');
    expect(figcaption).toBeInTheDocument();
  });
});
