/**
 * SVGDiagram Component
 * Renders accessible SVG diagram images with captions and lazy loading
 */

import React from 'react';
import Image from 'next/image';
import type { SVGDiagram as SVGDiagramType } from '@/lib/svg-utils';

interface SVGDiagramProps {
  diagram: SVGDiagramType;
  className?: string;
  priority?: boolean; // For above-the-fold images
}

export function SVGDiagram({ diagram, className = '', priority = false }: SVGDiagramProps) {
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

  // Placeholder blur color matching the theme
  const blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="%230a0a0a"/>
      <rect width="40" height="40" fill="%231a1a2e" opacity="0.5"/>
    </svg>`
  ).toString('base64')}`;

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
          // Lazy loading configuration
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          placeholder="blur"
          blurDataURL={blurDataURL}
          // Improve perceived performance
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
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

interface SVGDiagramWithLinkProps {
  diagram: SVGDiagramType;
  href?: string;
  linkTitle?: string;
  className?: string;
  priority?: boolean;
}

export function SVGDiagramWithLink({
  diagram,
  href,
  linkTitle = 'View full-size',
  className = '',
  priority = false,
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

  // Placeholder blur color matching the theme
  const blurDataURL = `data:image/svg+xml;base64,${Buffer.from(
    `<svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" fill="%230a0a0a"/>
      <rect width="40" height="40" fill="%231a1a2e" opacity="0.5"/>
    </svg>`
  ).toString('base64')}`;

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
          // Lazy loading configuration
          loading={priority ? 'eager' : 'lazy'}
          priority={priority}
          placeholder="blur"
          blurDataURL={blurDataURL}
          // Improve perceived performance
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
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
