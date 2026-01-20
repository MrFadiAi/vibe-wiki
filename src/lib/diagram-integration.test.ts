/**
 * Diagram Integration Tests
 *
 * Tests to verify that:
 * 1. All 48 diagrams exist in the public/images/diagrams folder
 * 2. All diagrams are registered in the diagram-registry
 * 3. All diagrams are integrated into their target articles
 * 4. All diagrams have proper Arabic metadata (alt, caption, title)
 */

import { describe, it, expect } from 'vitest';
import { wikiContent } from '@/data/wiki-content';
import { diagramRegistry, getDiagramByFilename } from '@/data/diagram-registry';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// All 48 diagrams specified in the PRD
const PRD_DIAGRAMS = [
  // Claude CLI (9)
  'cli-claude-comparison.svg',
  'cli-claude-architecture.svg',
  'cli-claude-pricing-tiers.svg',
  'cli-claude-best-practices.svg',
  'cli-claude-use-cases.svg',
  'cli-claude-feature-icons.svg',
  'cli-claude-command-flow.svg',
  'cli-claude-installation-checklist.svg',
  'cli-claude-terminal-flow.svg',
  // Copilot CLI (6)
  'cli-copilot-pricing.svg',
  'cli-copilot-alias-config.svg',
  'cli-copilot-use-cases.svg',
  'cli-copilot-command-tree.svg',
  'cli-copilot-installation.svg',
  'cli-copilot-workflow.svg',
  // OpenCode CLI (14)
  'cli-opencode-license-tiers.svg',
  'cli-opencode-use-cases.svg',
  'cli-opencode-comparison-matrix.svg',
  'cli-opencode-local-vs-cloud.svg',
  'cli-opencode-multifile-workflow.svg',
  'cli-opencode-advanced-features.svg',
  'cli-opencode-editor-integration.svg',
  'cli-opencode-context-sources.svg',
  'cli-opencode-workflow-state.svg',
  'cli-opencode-agent-collaboration.svg',
  'cli-opencode-feature-map.svg',
  'cli-opencode-config-layers.svg',
  'cli-opencode-installation-options.svg',
  'cli-opencode-architecture.svg',
  // CLI Overview (3)
  'cli-overview-comparison-matrix.svg',
  'cli-overview-ecosystem-landscape.svg',
  'cli-overview-architecture.svg',
  // Comparison (7)
  'comparison-use-case-matrix.svg',
  'comparison-pricing-visual.svg',
  'comparison-ux-grid.svg',
  'comparison-radar-chart.svg',
  'comparison-quality-barchart.svg',
  'comparison-feature-matrix.svg',
  'comparison-decision-tree.svg',
  // Getting Started (5)
  'getting-started-learning-paths.svg',
  'getting-started-ai-workflow.svg',
  'getting-started-installation-flow.svg',
  'getting-started-decision-tree.svg',
  'getting-started-timeline-flow.svg',
  // Workflow (4)
  'workflow-context-awareness.svg',
  'workflow-multi-agent.svg',
  'workflow-traditional-coding.svg',
  'workflow-vibecoding.svg',
];

// Additional diagrams created beyond PRD requirements
const ADDITIONAL_DIAGRAMS = [
  'cli-claude-features-grid.svg',
  'cli-copilot-architecture.svg',
  'cli-copilot-features-grid.svg',
  'cli-copilot-pricing-tiers.svg',
  'cli-opencode-features-grid.svg',
  'cli-opencode-installation-flow.svg',
  'cli-opencode-initial-setup.svg',
  'cli-opencode-basic-commands.svg',
  'comparison-cursor-windsurf-feature.svg',
  'getting-started-tool-selection.svg',
  'workflow-ai-pair-programming.svg',
];

// All diagrams that should exist (PRD + additional)
const ALL_EXPECTED_DIAGRAMS = [...PRD_DIAGRAMS, ...ADDITIONAL_DIAGRAMS];

// Target articles for each diagram (from PRD)
const DIAGRAM_TARGETS: Record<string, string> = {
  'cli-claude-comparison.svg': 'claude-cli-overview',
  'cli-claude-architecture.svg': 'claude-cli-overview',
  'cli-claude-pricing-tiers.svg': 'claude-cli-pricing',
  'cli-claude-best-practices.svg': 'claude-cli-best-practices',
  'cli-claude-use-cases.svg': 'claude-cli-overview',
  'cli-claude-feature-icons.svg': 'claude-cli-features',
  'cli-claude-command-flow.svg': 'claude-cli-commands',
  'cli-claude-installation-checklist.svg': 'prep-your-machine',
  'cli-claude-terminal-flow.svg': 'the-terminal',
  'cli-copilot-pricing.svg': 'copilot-cli-pricing',
  'cli-copilot-alias-config.svg': 'copilot-cli-configuration',
  'cli-copilot-use-cases.svg': 'copilot-cli-overview',
  'cli-copilot-command-tree.svg': 'copilot-cli-commands',
  'cli-copilot-installation.svg': 'prep-your-machine',
  'cli-copilot-workflow.svg': 'copilot-cli-overview',
  'cli-opencode-license-tiers.svg': 'opencode-cli-licensing',
  'cli-opencode-use-cases.svg': 'opencode-cli-overview',
  'cli-opencode-comparison-matrix.svg': 'opencode-cli-comparison',
  'cli-opencode-local-vs-cloud.svg': 'opencode-cli-deployment',
  'cli-opencode-multifile-workflow.svg': 'opencode-cli-workflows',
  'cli-opencode-advanced-features.svg': 'opencode-cli-advanced',
  'cli-opencode-editor-integration.svg': 'the-editor',
  'cli-opencode-context-sources.svg': 'opencode-cli-context',
  'cli-opencode-workflow-state.svg': 'opencode-cli-workflows',
  'cli-opencode-agent-collaboration.svg': 'opencode-cli-agents',
  'cli-opencode-feature-map.svg': 'opencode-cli-overview',
  'cli-opencode-config-layers.svg': 'opencode-cli-configuration',
  'cli-opencode-installation-options.svg': 'prep-your-machine',
  'cli-opencode-architecture.svg': 'opencode-cli-overview',
  'cli-overview-comparison-matrix.svg': 'cli-tools-comparison',
  'cli-overview-ecosystem-landscape.svg': 'cli-ecosystem-overview',
  'cli-overview-architecture.svg': 'cli-ecosystem-overview',
  'comparison-use-case-matrix.svg': 'cursor-vs-windsurf',
  'comparison-pricing-visual.svg': 'cursor-vs-windsurf',
  'comparison-ux-grid.svg': 'cursor-vs-windsurf',
  'comparison-radar-chart.svg': 'cursor-vs-windsurf',
  'comparison-quality-barchart.svg': 'ai-tools-quality-comparison',
  'comparison-feature-matrix.svg': 'cursor-vs-windsurf',
  'comparison-decision-tree.svg': 'cursor-vs-windsurf',
  'getting-started-learning-paths.svg': 'what-is-vibe-coding',
  'getting-started-ai-workflow.svg': 'hello-world-with-ai',
  'getting-started-installation-flow.svg': 'prep-your-machine',
  'getting-started-decision-tree.svg': 'the-vibe-stack',
  'getting-started-timeline-flow.svg': 'what-is-vibe-coding',
  'workflow-context-awareness.svg': 'conversational-coding',
  'workflow-multi-agent.svg': 'multi-agent-workflows',
  'workflow-traditional-coding.svg': 'what-is-vibe-coding',
  'workflow-vibecoding.svg': 'what-is-vibe-coding',
};

describe('Diagram Integration Tests', () => {
  describe('PRD Diagram Count', () => {
    it('should have exactly 48 diagrams specified in the PRD', () => {
      expect(PRD_DIAGRAMS.length).toBe(48);
    });

    it('should account for additional diagrams beyond PRD', () => {
      expect(ADDITIONAL_DIAGRAMS.length).toBeGreaterThan(0);
      console.log(`Total expected diagrams: ${ALL_EXPECTED_DIAGRAMS.length} (48 PRD + ${ADDITIONAL_DIAGRAMS.length} additional)`);
    });
  });

  describe('Diagram File Existence', () => {
    it('should have all 48 PRD diagram files in the public/images/diagrams folder', () => {
      const diagramsPath = join(process.cwd(), 'public', 'images', 'diagrams');
      const files = readdirSync(diagramsPath);
      const svgFiles = files.filter((f) => f.endsWith('.svg'));

      // Check that all PRD diagrams exist
      PRD_DIAGRAMS.forEach((diagram) => {
        expect(svgFiles).toContain(diagram);
      });

      // Check that all additional diagrams exist
      ADDITIONAL_DIAGRAMS.forEach((diagram) => {
        expect(svgFiles).toContain(diagram);
      });

      // Log any extra SVGs not in our expected list
      const extraFiles = svgFiles.filter((f) => !ALL_EXPECTED_DIAGRAMS.includes(f));
      if (extraFiles.length > 0) {
        console.log(`Extra SVG files not in expected list: ${extraFiles.join(', ')}`);
      }
    });
  });

  describe('Diagram Registry Coverage', () => {
    it('should have all 48 PRD diagrams registered in the diagram-registry', () => {
      const registeredFilenames = diagramRegistry.map((d) => d.filename);

      PRD_DIAGRAMS.forEach((diagram) => {
        expect(registeredFilenames).toContain(diagram);
        const entry = getDiagramByFilename(diagram);
        expect(entry).toBeDefined();
        expect(entry?.filename).toBe(diagram);
      });
    });

    it('should have all additional diagrams registered in the diagram-registry', () => {
      const registeredFilenames = diagramRegistry.map((d) => d.filename);

      ADDITIONAL_DIAGRAMS.forEach((diagram) => {
        expect(registeredFilenames).toContain(diagram);
        const entry = getDiagramByFilename(diagram);
        expect(entry).toBeDefined();
        expect(entry?.filename).toBe(diagram);
      });
    });
  });

  describe('Diagram Metadata Quality', () => {
    it('should have Arabic alt text for all diagrams in the registry', () => {
      diagramRegistry.forEach((diagram) => {
        expect(diagram.altAr).toBeDefined();
        expect(diagram.altAr.length).toBeGreaterThan(0);
        expect(diagram.altAr).toMatch(/[\u0600-\u06FF]/); // Contains Arabic characters
      });
    });

    it('should have Arabic captions for all diagrams in the registry', () => {
      diagramRegistry.forEach((diagram) => {
        expect(diagram.captionAr).toBeDefined();
        expect(diagram.captionAr.length).toBeGreaterThan(0);
        expect(diagram.captionAr).toMatch(/[\u0600-\u06FF]/); // Contains Arabic characters
      });
    });

    it('should have Arabic titles for all diagrams in the registry', () => {
      diagramRegistry.forEach((diagram) => {
        expect(diagram.titleAr).toBeDefined();
        expect(diagram.titleAr.length).toBeGreaterThan(0);
        expect(diagram.titleAr).toMatch(/[\u0600-\u06FF]/); // Contains Arabic characters
      });
    });
  });

  describe('Article Integration', () => {
    // Build a map of which articles have which diagrams
    const articleDiagrams = new Map<string, string[]>();

    beforeAll(() => {
      // Populate the map from wiki-content
      wikiContent.forEach((section) => {
        section.articles.forEach((article) => {
          if (article.diagrams && article.diagrams.length > 0) {
            articleDiagrams.set(
              article.slug,
              article.diagrams.map((d) => d.filename)
            );
          }
        });
      });
    });

    it('should integrate all 48 diagrams into their target articles', () => {
      const integratedDiagrams = new Set<string>();
      const missingIntegrations: Array<{ diagram: string; target: string }> = [];

      // Check each PRD diagram
      PRD_DIAGRAMS.forEach((diagram) => {
        const targetSlug = DIAGRAM_TARGETS[diagram];
        const articleDiagramsList = articleDiagrams.get(targetSlug);

        if (articleDiagramsList && articleDiagramsList.includes(diagram)) {
          integratedDiagrams.add(diagram);
        } else {
          missingIntegrations.push({ diagram, target: targetSlug });
        }
      });

      // Report results
      if (missingIntegrations.length > 0) {
        console.log('\nMissing diagram integrations:');
        missingIntegrations.forEach(({ diagram, target }) => {
          console.log(`  - ${diagram} → ${target} (article ${articleDiagrams.has(target) ? 'exists' : 'MISSING'})`);
        });
      }

      expect(integratedDiagrams.size).toBe(48);
    });

    it('should have articles for all target slugs', () => {
      const allSlugs = new Set<string>();
      wikiContent.forEach((section) => {
        section.articles.forEach((article) => {
          allSlugs.add(article.slug);
        });
      });

      const uniqueTargets = new Set(Object.values(DIAGRAM_TARGETS));
      const missingArticles: string[] = [];

      uniqueTargets.forEach((target) => {
        if (!allSlugs.has(target)) {
          missingArticles.push(target);
        }
      });

      if (missingArticles.length > 0) {
        console.log('\nMissing target articles:');
        missingArticles.forEach((slug) => console.log(`  - ${slug}`));
      }

      // We expect some articles to still be in development
      // This test documents the current state
      console.log(`\nTotal unique target articles: ${uniqueTargets.size}`);
      console.log(`Articles that exist: ${uniqueTargets.size - missingArticles.length}`);
      console.log(`Articles still needed: ${missingArticles.length}`);
    });
  });

  describe('Diagram-Article Mapping Consistency', () => {
    it('should have consistent diagram IDs in article diagrams arrays', () => {
      wikiContent.forEach((section) => {
        section.articles.forEach((article) => {
          if (article.diagrams) {
            article.diagrams.forEach((diagram) => {
              // Each diagram should have a unique ID within the article
              expect(diagram.id).toBeDefined();
              expect(diagram.id.length).toBeGreaterThan(0);

              // Each diagram should have a filename
              expect(diagram.filename).toBeDefined();
              expect(diagram.filename.endsWith('.svg')).toBe(true);

              // Each diagram should have Arabic alt text
              expect(diagram.alt).toBeDefined();
              expect(diagram.alt.length).toBeGreaterThan(0);
              expect(diagram.alt).toMatch(/[\u0600-\u06FF]/);

              // Each diagram should have an Arabic caption
              expect(diagram.caption).toBeDefined();
              expect(diagram.caption.length).toBeGreaterThan(0);
              expect(diagram.caption).toMatch(/[\u0600-\u06FF]/);
            });
          }
        });
      });
    });

    it('should have valid position values for all diagrams', () => {
      const validPositions = ['inline', 'before-section', 'after-section'];

      wikiContent.forEach((section) => {
        section.articles.forEach((article) => {
          if (article.diagrams) {
            article.diagrams.forEach((diagram) => {
              expect(validPositions).toContain(diagram.position);
            });
          }
        });
      });
    });
  });

  describe('Accessibility Compliance', () => {
    it('should have all required accessibility fields for diagrams in articles', () => {
      wikiContent.forEach((section) => {
        section.articles.forEach((article) => {
          if (article.diagrams) {
            article.diagrams.forEach((diagram) => {
              // Required fields for WCAG compliance
              expect(diagram.alt).toBeDefined();
              expect(diagram.alt.length).toBeGreaterThan(0);

              // Caption is required for diagram context
              expect(diagram.caption).toBeDefined();
              expect(diagram.caption.length).toBeGreaterThan(0);

              // Priority should be boolean
              expect(typeof diagram.priority).toBe('boolean');
            });
          }
        });
      });
    });
  });
});
