/**
 * Mobile CSS Utilities
 *
 * Utilities for generating and managing mobile-specific CSS
 * including touch targets, safe areas, responsive utilities, and more.
 */

/**
 * Generate safe area CSS
 */
export function generateSafeAreaCSS(): string {
  return `
    :root {
      --safe-area-inset-top: env(safe-area-inset-top, 0px);
      --safe-area-inset-right: env(safe-area-inset-right, 0px);
      --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
      --safe-area-inset-left: env(safe-area-inset-left, 0px);
    }

    .safe-top {
      padding-top: max(1rem, var(--safe-area-inset-top));
    }

    .safe-bottom {
      padding-bottom: max(1rem, var(--safe-area-inset-bottom));
    }

    .safe-left {
      padding-left: max(1rem, var(--safe-area-inset-left));
    }

    .safe-right {
      padding-right: max(1rem, var(--safe-area-inset-right));
    }

    .safe-all {
      padding: max(1rem, var(--safe-area-inset-top))
                  max(1rem, var(--safe-area-inset-right))
                  max(1rem, var(--safe-area-inset-bottom))
                  max(1rem, var(--safe-area-inset-left));
    }

    .safe-margin-top {
      margin-top: max(1rem, var(--safe-area-inset-top));
    }

    .safe-margin-bottom {
      margin-bottom: max(1rem, var(--safe-area-inset-bottom));
    }

    .safe-margin-left {
      margin-left: max(1rem, var(--safe-area-inset-left));
    }

    .safe-margin-right {
      margin-right: max(1rem, var(--safe-area-inset-right));
    }
  `;
}

/**
 * Generate touch target CSS
 */
export function generateTouchTargetCSS(minSize: number = 44): string {
  return `
    .touch-target {
      min-width: ${minSize}px;
      min-height: ${minSize}px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .touch-target::before {
      content: '';
      position: absolute;
      top: -10px;
      left: -10px;
      right: -10px;
      bottom: -10px;
    }

    button,
    a,
    input[type="button"],
    input[type="submit"],
    [role="button"] {
      min-width: ${minSize}px;
      min-height: ${minSize}px;
      touch-action: manipulation;
    }

    .touch-spacing {
      gap: 8px;
    }

    .touch-row {
      display: flex;
      flex-direction: row;
      gap: 8px;
    }

    .touch-column {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;
}

/**
 * Generate mobile viewport CSS
 */
export function generateMobileViewportCSS(): string {
  return `
    :root {
      --vh: 1vh;
    }

    @supports (height: 100dvh) {
      :root {
        --vh: 1dvh;
      }
    }

    .h-screen {
      height: 100vh;
      height: calc(var(--vh, 1vh) * 100);
    }

    .min-h-screen {
      min-height: 100vh;
      min-height: calc(var(--vh, 1vh) * 100);
    }

    .h-screen-safe {
      height: 100vh;
      height: calc(100vh - var(--safe-area-inset-top) - var(--safe-area-inset-bottom));
    }

    .min-h-screen-safe {
      min-height: 100vh;
      min-height: calc(100vh - var(--safe-area-inset-top) - var(--safe-area-inset-bottom));
    }
  `;
}

/**
 * Generate mobile typography CSS
 */
export function generateMobileTypographyCSS(): string {
  return `
    .text-responsive {
      font-size: clamp(1rem, 2.5vw, 1.25rem);
    }

    .text-responsive-sm {
      font-size: clamp(0.875rem, 2vw, 1rem);
    }

    .text-responsive-lg {
      font-size: clamp(1.25rem, 3vw, 1.5rem);
    }

    .text-responsive-xl {
      font-size: clamp(1.5rem, 4vw, 2rem);
    }

    .text-responsive-2xl {
      font-size: clamp(2rem, 5vw, 2.5rem);
    }

    @media (max-width: 640px) {
      .text-mobile-base {
        font-size: 1rem;
        line-height: 1.5;
      }

      .text-mobile-sm {
        font-size: 0.875rem;
        line-height: 1.4;
      }

      .text-mobile-lg {
        font-size: 1.125rem;
        line-height: 1.6;
      }
    }
  `;
}

/**
 * Generate mobile spacing CSS
 */
export function generateMobileSpacingCSS(): string {
  return `
    .mobile-container {
      padding-left: 1rem;
      padding-right: 1rem;
    }

    @media (min-width: 640px) {
      .mobile-container {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
      }
    }

    @media (min-width: 1024px) {
      .mobile-container {
        padding-left: 2rem;
        padding-right: 2rem;
      }
    }

    .mobile-gap {
      gap: 0.5rem;
    }

    @media (min-width: 640px) {
      .mobile-gap {
        gap: 1rem;
      }
    }

    .mobile-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1rem;
    }

    @media (min-width: 640px) {
      .mobile-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .mobile-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }
  `;
}

/**
 * Generate mobile performance CSS
 */
export function generateMobilePerformanceCSS(): string {
  return `
    /* GPU acceleration for smooth animations */
    .gpu-accelerated {
      transform: translateZ(0);
      will-change: transform;
    }

    /* Smooth scrolling */
    .smooth-scroll {
      -webkit-overflow-scrolling: touch;
      scroll-behavior: smooth;
    }

    /* Prevent scroll bounce */
    .no-bounce {
      overscroll-behavior: none;
    }

    /* Hardware acceleration for common transforms */
    .hardware-accelerate {
      transform: translate3d(0, 0, 0);
      backface-visibility: hidden;
      perspective: 1000px;
    }

    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
      *,
      *::before,
      *::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }
    }

    /* Image lazy loading fade-in */
    .lazy-load {
      opacity: 0;
      transition: opacity 0.3s ease-in;
    }

    .lazy-load.loaded {
      opacity: 1;
    }

    /* Content visibility for performance */
    .content-visibility-auto {
      content-visibility: auto;
      contain-intrinsic-size: auto 500px;
    }
  `;
}

/**
 * Generate mobile interaction CSS
 */
export function generateMobileInteractionCSS(): string {
  return `
    /* Remove tap highlight */
    * {
      -webkit-tap-highlight-color: transparent;
      -webkit-touch-callout: none;
    }

    /* Preserve tap highlight for interactive elements */
    button,
    a,
    input,
    textarea,
    select {
      -webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
    }

    /* Active state feedback */
    .active-scale:active {
      transform: scale(0.97);
    }

    .active-opacity:active {
      opacity: 0.7;
    }

    .active-brightness:active {
      filter: brightness(0.9);
    }

    /* Touch feedback */
    @media (hover: none) and (pointer: coarse) {
      .touch-feedback:hover {
        background-color: transparent;
      }

      .touch-feedback:active {
        background-color: rgba(0, 0, 0, 0.05);
      }
    }

    /* Prevent text selection on UI elements */
    .no-select {
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
    }

    /* Allow text selection on content */
    .select-text {
      user-select: text;
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
    }
  `;
}

/**
 * Generate mobile form CSS
 */
export function generateMobileFormCSS(): string {
  return `
    /* Prevent zoom on input focus */
    input[type="text"],
    input[type="email"],
    input[type="number"],
    input[type="tel"],
    input[type="url"],
    input[type="password"],
    input[type="search"],
    textarea,
    select {
      font-size: 16px !important;
    }

    /* Mobile-friendly input styling */
    .input-mobile {
      width: 100%;
      padding: 12px 16px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 8px;
      background-color: #fff;
      -webkit-appearance: none;
      appearance: none;
    }

    .input-mobile:focus {
      outline: none;
      border-color: #007bff;
      box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
    }

    /* Mobile-friendly checkbox and radio */
    .checkbox-mobile,
    .radio-mobile {
      width: 20px;
      height: 20px;
      min-width: 44px;
      min-height: 44px;
      padding: 12px;
      cursor: pointer;
    }

    /* Mobile-friendly select */
    .select-mobile {
      position: relative;
      display: inline-block;
      width: 100%;
    }

    .select-mobile::after {
      content: '';
      position: absolute;
      right: 16px;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 5px solid transparent;
      border-right: 5px solid transparent;
      border-top: 5px solid #333;
      pointer-events: none;
    }
  `;
}

/**
 * Generate mobile layout CSS
 */
export function generateMobileLayoutCSS(): string {
  return `
    /* Mobile-first flexbox utilities */
    .flex-mobile {
      display: flex;
      flex-direction: column;
    }

    @media (min-width: 768px) {
      .flex-mobile {
        flex-direction: row;
      }
    }

    .flex-mobile-reverse {
      display: flex;
      flex-direction: column-reverse;
    }

    @media (min-width: 768px) {
      .flex-mobile-reverse {
        flex-direction: row-reverse;
      }
    }

    /* Stack on mobile */
    .stack-mobile > * + * {
      margin-top: 1rem;
    }

    @media (min-width: 768px) {
      .stack-mobile > * + * {
        margin-top: 0;
        margin-left: 1rem;
      }
    }

    /* Mobile sidebar */
    .sidebar-mobile {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 50;
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
    }

    .sidebar-mobile.open {
      transform: translateX(0);
    }

    @media (min-width: 1024px) {
      .sidebar-mobile {
        position: relative;
        transform: none;
      }
    }

    /* Mobile overlay */
    .overlay-mobile {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 40;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease-in-out;
    }

    .overlay-mobile.open {
      opacity: 1;
      pointer-events: auto;
    }

    /* Mobile bottom sheet */
    .bottom-sheet {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: white;
      border-radius: 16px 16px 0 0;
      transform: translateY(100%);
      transition: transform 0.3s ease-in-out;
      z-index: 50;
      max-height: 90vh;
      overflow-y: auto;
    }

    .bottom-sheet.open {
      transform: translateY(0);
    }

    .bottom-sheet-handle {
      width: 40px;
      height: 4px;
      background-color: #ccc;
      border-radius: 2px;
      margin: 8px auto;
    }
  `;
}

/**
 * Generate complete mobile CSS bundle
 */
export function generateMobileCSSBundle(options: {
  safeArea?: boolean;
  touchTargets?: boolean;
  viewport?: boolean;
  typography?: boolean;
  spacing?: boolean;
  performance?: boolean;
  interaction?: boolean;
  forms?: boolean;
  layout?: boolean;
} = {}): string {
  const {
    safeArea = true,
    touchTargets = true,
    viewport = true,
    typography = true,
    spacing = true,
    performance = true,
    interaction = true,
    forms = true,
    layout = true,
  } = options;

  let css = '';

  if (safeArea) css += generateSafeAreaCSS();
  if (touchTargets) css += generateTouchTargetCSS();
  if (viewport) css += generateMobileViewportCSS();
  if (typography) css += generateMobileTypographyCSS();
  if (spacing) css += generateMobileSpacingCSS();
  if (performance) css += generateMobilePerformanceCSS();
  if (interaction) css += generateMobileInteractionCSS();
  if (forms) css += generateMobileFormCSS();
  if (layout) css += generateMobileLayoutCSS();

  return css;
}

/**
 * Inject mobile CSS into document
 */
export function injectMobileCSS(options: Parameters<typeof generateMobileCSSBundle>[0] = {}): () => void {
  if (typeof document === 'undefined') return () => {};

  const style = document.createElement('style');
  style.id = 'mobile-optimization-css';
  style.textContent = generateMobileCSSBundle(options);
  document.head.appendChild(style);

  return () => {
    if (style.parentNode) {
      style.parentNode.removeChild(style);
    }
  };
}

/**
 * Get mobile CSS class names
 */
export function getMobileClassNames(type: 'safe' | 'touch' | 'layout', ...modifiers: string[]): string {
  const baseClass = `mobile-${type}`;
  const modifierClasses = modifiers.map((m) => `${baseClass}-${m}`);
  return [baseClass, ...modifierClasses].join(' ');
}

/**
 * Generate responsive breakpoint CSS
 */
export function generateResponsiveCSS(breakpoints: { sm: number; md: number; lg: number; xl: number } = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
}): string {
  return `
    /* Mobile first - base styles apply to mobile */

    /* Small devices (landscape phones, 640px and up) */
    @media (min-width: ${breakpoints.sm}px) {
      .sm\\:hidden { display: none; }
      .sm\\:block { display: block; }
      .sm\\:flex { display: flex; }
      .sm\\:grid { display: grid; }
      .sm\\:text-left { text-align: left; }
      .sm\\:text-right { text-align: right; }
    }

    /* Medium devices (tablets, 768px and up) */
    @media (min-width: ${breakpoints.md}px) {
      .md\\:hidden { display: none; }
      .md\\:block { display: block; }
      .md\\:flex { display: flex; }
      .md\\:grid { display: grid; }
      .md\\:flex-row { flex-direction: row; }
      .md\\:flex-col { flex-direction: column; }
    }

    /* Large devices (desktops, 1024px and up) */
    @media (min-width: ${breakpoints.lg}px) {
      .lg\\:hidden { display: none; }
      .lg\\:block { display: block; }
      .lg\\:flex { display: flex; }
      .lg\\:grid { display: grid; }
      .lg\\:flex-row { flex-direction: row; }
      .lg\\:flex-col { flex-direction: column; }
    }

    /* Extra large devices (large desktops, 1280px and up) */
    @media (min-width: ${breakpoints.xl}px) {
      .xl\\:hidden { display: none; }
      .xl\\:block { display: block; }
      .xl\\:flex { display: flex; }
      .xl\\:grid { display: grid; }
    }
  `;
}

/**
 * Generate print-optimized CSS for mobile
 */
export function generatePrintCSS(): string {
  return `
    @media print {
      /* Hide mobile-specific elements */
      .mobile-only,
      .sidebar-mobile,
      .bottom-sheet,
      .overlay-mobile {
        display: none !important;
      }

      /* Ensure readable text */
      body {
        font-size: 12pt;
        line-height: 1.5;
        color: #000;
        background-color: #fff;
      }

      /* Remove backgrounds and shadows */
      * {
        background-color: transparent !important;
        box-shadow: none !important;
        text-shadow: none !important;
      }

      /* Show links */
      a[href]:after {
        content: " (" attr(href) ")";
      }

      /* Show image sources */
      img[src]:after {
        content: " [" attr(src) "]";
      }
    }
  `;
}
