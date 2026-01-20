/**
 * SVGDiagram Component
 * Renders accessible SVG diagram images with captions
 */

import React from 'react';
import Image from 'next/image';
import type { SVGDiagram as SVGDiagramType } from '@/lib/svg-utils';

interface SVGDiagramProps {
  diagram: SVGDiagramType;
  className?: string;
}

export function SVGDiagram({ diagram, className = '' }: SVGDiagramProps) {
  const { src, alt, caption, maxWidth, title, description } = diagram;

  // Build figure className
  const figureClasses = [
    'svg-diagram-container',
    'my-8',
    'mx-auto',
    maxWidth === 'full' ? 'w-full' : maxWidth ? `max-w-${maxWidth}` : 'max-w-3xl',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Build image className
  const imgClasses = [
    'svg-diagram',
    'w-full',
    'h-auto',
    'rounded-lg',
    'shadow-lg',
    'dark:shadow-neon-cyan/20',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure className={figureClasses}>
      <div className="relative">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          className={imgClasses}
          // Accessibility props
          title={title}
          // Priority loading for above-the-fold diagrams
          priority={false}
        />
        {description && (
          <span className="sr-only" id={`${src}-desc`}>
            {description}
          </span>
        )}
      </div>
      {caption && (
        <figcaption className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/**
 * SVGDiagramGrid Component
 * Renders a grid of multiple SVG diagrams
 */

interface SVGDiagramGridProps {
  diagrams: SVGDiagramType[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function SVGDiagramGrid({
  diagrams,
  columns = 2,
  className = '',
}: SVGDiagramGridProps) {
  const gridClasses = [
    'grid',
    'gap-6',
    'my-8',
    {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    }[columns],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={gridClasses}>
      {diagrams.map((diagram, index) => (
        <SVGDiagram key={`${diagram.src}-${index}`} diagram={diagram} />
      ))}
    </div>
  );
}

/**
 * SVGDiagramWithLink Component
 * Renders an SVG diagram that links to a full-size version
 */

interface SVGDiagramWithLinkProps extends SVGDiagramProps {
  href?: string;
  linkTitle?: string;
}

export function SVGDiagramWithLink({
  diagram,
  href,
  linkTitle = 'View full-size',
  className = '',
}: SVGDiagramWithLinkProps) {
  const { src, alt, caption, maxWidth, title, description } = diagram;
  const linkHref = href || src;

  // Build figure className
  const figureClasses = [
    'svg-diagram-container',
    'my-8',
    'mx-auto',
    maxWidth === 'full' ? 'w-full' : maxWidth ? `max-w-${maxWidth}` : 'max-w-3xl',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Build image className
  const imgClasses = [
    'svg-diagram',
    'w-full',
    'h-auto',
    'rounded-lg',
    'shadow-lg',
    'dark:shadow-neon-cyan/20',
    'transition-transform',
    'hover:scale-[1.02]',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <figure className={figureClasses}>
      <a href={linkHref} target="_blank" rel="noopener noreferrer" className="block">
        <Image
          src={src}
          alt={alt}
          width={800}
          height={600}
          className={imgClasses}
          title={title}
        />
        {description && (
          <span className="sr-only" id={`${src}-desc`}>
            {description}
          </span>
        )}
      </a>
      {(caption || linkHref) && (
        <figcaption className="mt-3 text-center text-sm text-gray-600 dark:text-gray-400">
          {caption && <span className="italic">{caption}</span>}
          {caption && linkHref && ' — '}
          {linkHref && (
            <a
              href={linkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-cyan hover:underline ml-1"
            >
              {linkTitle} ↗
            </a>
          )}
        </figcaption>
      )}
    </figure>
  );
}

export default SVGDiagram;
