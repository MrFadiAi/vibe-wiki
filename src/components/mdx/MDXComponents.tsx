"use client";

import React, { ReactNode } from "react";
import { CodeBlock } from "./CodeBlock";

// Types for MDX components
interface HeadingProps {
  children: ReactNode;
  id?: string;
}

interface BaseProps {
  children: ReactNode;
  className?: string;
}

interface LinkProps extends BaseProps {
  href?: string;
}

interface TableCellProps extends BaseProps {
  align?: "left" | "center" | "right";
}

// Heading components with scroll-margin for ToC
function H1({ children, id }: HeadingProps) {
  return (
    <h1 
      id={id}
      className="text-4xl md:text-5xl font-bold mb-8 gradient-text leading-tight scroll-mt-24"
    >
      {children}
    </h1>
  );
}

function H2({ children, id }: HeadingProps) {
  const headingId = id || (typeof children === "string" ? children.replace(/\s+/g, "-").toLowerCase() : undefined);
  return (
    <h2 
      id={headingId}
      className="text-2xl md:text-3xl font-bold mb-5 mt-12 gradient-text scroll-mt-24"
    >
      {children}
    </h2>
  );
}

function H3({ children, id }: HeadingProps) {
  const headingId = id || (typeof children === "string" ? children.replace(/\s+/g, "-").toLowerCase() : undefined);
  return (
    <h3 
      id={headingId}
      className="text-xl md:text-2xl font-semibold mb-4 mt-10 text-foreground scroll-mt-24"
    >
      {children}
    </h3>
  );
}

function H4({ children, id }: HeadingProps) {
  return (
    <h4 
      id={id}
      className="text-lg md:text-xl font-semibold mb-3 mt-8 text-foreground scroll-mt-24"
    >
      {children}
    </h4>
  );
}

function H5({ children, id }: HeadingProps) {
  return (
    <h5 
      id={id}
      className="text-base md:text-lg font-semibold mb-2 mt-6 text-foreground scroll-mt-24"
    >
      {children}
    </h5>
  );
}

function H6({ children, id }: HeadingProps) {
  return (
    <h6 
      id={id}
      className="text-sm md:text-base font-semibold mb-2 mt-4 text-muted-foreground scroll-mt-24"
    >
      {children}
    </h6>
  );
}

// Paragraph
function P({ children }: BaseProps) {
  return (
    <p className="my-5 text-lg leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

// Lists with neon bullets
function UL({ children }: BaseProps) {
  return (
    <ul className="my-6 space-y-2 mr-6">
      {children}
    </ul>
  );
}

function OL({ children }: BaseProps) {
  return (
    <ol className="my-6 space-y-2 mr-6 list-decimal marker:text-neon-cyan">
      {children}
    </ol>
  );
}

function LI({ children }: BaseProps) {
  return (
    <li className="flex items-start gap-3 py-1 text-muted-foreground">
      <span className="mt-2.5 w-2 h-2 rounded-full bg-gradient-to-r from-neon-cyan to-neon-purple flex-shrink-0" />
      <span className="flex-1">{children}</span>
    </li>
  );
}

// Blockquote with RTL border
function Blockquote({ children }: BaseProps) {
  return (
    <blockquote className="my-6 pr-6 border-r-4 border-neon-purple bg-neon-purple/5 py-4 pl-4 rounded-l-xl text-muted-foreground italic">
      {children}
    </blockquote>
  );
}

// Inline code
function InlineCode({ children }: BaseProps) {
  return (
    <code 
      className="px-2 py-1 rounded-lg bg-neon-cyan/10 text-neon-cyan text-sm font-mono border border-neon-cyan/20"
      dir="ltr"
    >
      {children}
    </code>
  );
}

// Pre + Code block wrapper
interface PreProps {
  children: React.ReactElement<{ children: string; className?: string }>;
}

function Pre({ children }: PreProps) {
  // Extract code and language from children
  const codeElement = React.Children.only(children);
  
  if (!React.isValidElement(codeElement)) {
    return <pre>{children}</pre>;
  }

  const code = typeof codeElement.props.children === "string" 
    ? codeElement.props.children.trim() 
    : "";
  
  const className = codeElement.props.className || "";
  const language = className.replace("language-", "") || "plaintext";

  return <CodeBlock code={code} language={language} />;
}

// Table components with glass effect
function Table({ children }: BaseProps) {
  return (
    <div className="my-8 overflow-x-auto rounded-2xl glass border border-border">
      <table className="w-full border-collapse">
        {children}
      </table>
    </div>
  );
}

function THead({ children }: BaseProps) {
  return (
    <thead className="border-b border-border bg-white/5">
      {children}
    </thead>
  );
}

function TBody({ children }: BaseProps) {
  return <tbody>{children}</tbody>;
}

function TR({ children }: BaseProps) {
  return (
    <tr className="border-b border-border/50 hover:bg-white/5 transition-colors">
      {children}
    </tr>
  );
}

function TH({ children, align }: TableCellProps) {
  const alignClass = align === "center" ? "text-center" : align === "left" ? "text-left" : "text-right";
  return (
    <th className={`px-6 py-4 text-sm font-semibold text-neon-cyan ${alignClass}`}>
      {children}
    </th>
  );
}

function TD({ children, align }: TableCellProps) {
  const alignClass = align === "center" ? "text-center" : align === "left" ? "text-left" : "text-right";
  return (
    <td className={`px-6 py-4 text-sm ${alignClass}`}>
      {children}
    </td>
  );
}

// Link
function A({ href, children }: LinkProps) {
  const isExternal = href?.startsWith("http");
  return (
    <a 
      href={href}
      className="text-neon-cyan hover:text-neon-purple underline underline-offset-4 decoration-neon-cyan/30 hover:decoration-neon-purple/50 transition-colors"
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}

// Horizontal rule
function HR() {
  return (
    <hr className="my-12 border-0 h-px bg-gradient-to-l from-transparent via-border to-transparent" />
  );
}

// Strong (bold)
function Strong({ children }: BaseProps) {
  return (
    <strong className="font-semibold text-foreground">
      {children}
    </strong>
  );
}

// Emphasis (italic)
function Em({ children }: BaseProps) {
  return (
    <em className="text-neon-cyan not-italic">
      {children}
    </em>
  );
}

// Image
interface ImageProps {
  src?: string;
  alt?: string;
}

function Img({ src, alt }: ImageProps) {
  return (
    <figure className="my-8">
      <div className="rounded-2xl overflow-hidden glass border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={src} 
          alt={alt || ""} 
          className="w-full h-auto"
          loading="lazy"
        />
      </div>
      {alt && (
        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

// Export all MDX components
export const MDXComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  h4: H4,
  h5: H5,
  h6: H6,
  p: P,
  ul: UL,
  ol: OL,
  li: LI,
  blockquote: Blockquote,
  code: InlineCode,
  pre: Pre,
  table: Table,
  thead: THead,
  tbody: TBody,
  tr: TR,
  th: TH,
  td: TD,
  a: A,
  hr: HR,
  strong: Strong,
  em: Em,
  img: Img,
};

export default MDXComponents;
