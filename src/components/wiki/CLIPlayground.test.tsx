import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import {
  CLIPlayground,
  ClaudeCLIPlayground,
  CopilotCLIPlayground,
  OpenCodeCLIPlayground,
  BashTerminal,
  type CLITool,
  type CLICommand,
} from './CLIPlayground';

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve()),
};

Object.assign(navigator, { clipboard: mockClipboard });

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, className, title }: {
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
    title?: string;
  }) => createElement('button', { onClick, className, title }, children),
}));

// Mock cn utility
vi.mock('@/lib/utils', () => ({
  cn: (...classes: (string | boolean | undefined | null)[]) => {
    return classes.filter(Boolean).join(' ');
  },
}));

describe('CLIPlayground', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders Claude CLI playground with welcome message', () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));
      expect(screen.getByText('Claude CLI Playground')).toBeDefined();
      expect(screen.getByText(/Welcome to Claude CLI/)).toBeDefined();
    });

    it('renders Copilot CLI playground with welcome message', () => {
      render(createElement(CLIPlayground, { tool: 'copilot' as CLITool }));
      expect(screen.getByText('GitHub Copilot CLI Playground')).toBeDefined();
      expect(screen.getByText(/Welcome to GitHub Copilot CLI/)).toBeDefined();
    });

    it('renders OpenCode CLI playground with welcome message', () => {
      render(createElement(CLIPlayground, { tool: 'opencode' as CLITool }));
      expect(screen.getByText('OpenCode CLI Playground')).toBeDefined();
      expect(screen.getByText(/Welcome to OpenCode CLI/)).toBeDefined();
    });

    it('renders Bash terminal with welcome message', () => {
      render(createElement(BashTerminal));
      expect(screen.getByText('Bash Terminal')).toBeDefined();
      expect(screen.getByText(/Bash Terminal - Practice common commands/)).toBeDefined();
    });

    it('displays tool badge', () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));
      expect(screen.getByText('CLAUDE')).toBeDefined();
    });

    it('renders custom title when provided', () => {
      render(
        createElement(CLIPlayground, {
          tool: 'claude' as CLITool,
          title: 'Custom Terminal',
        })
      );
      expect(screen.getByText('Custom Terminal')).toBeDefined();
    });

    it('renders custom welcome message when provided', () => {
      render(
        createElement(CLIPlayground, {
          tool: 'claude' as CLITool,
          welcomeMessage: 'Custom welcome message',
        })
      );
      expect(screen.getByText('Custom welcome message')).toBeDefined();
    });

    it('shows quick reference sidebar by default', () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));
      expect(screen.getByText('Quick Reference')).toBeDefined();
    });

    it('hides quick reference when showQuickReference is false', () => {
      render(
        createElement(CLIPlayground, {
          tool: 'claude' as CLITool,
          showQuickReference: false,
        })
      );
      expect(screen.queryByText('Quick Reference')).toBeNull();
    });

    it('renders all control buttons', () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      const buttons = screen.getAllByRole('button');
      expect(buttons.some((btn) => btn.getAttribute('title') === 'Toggle quick reference')).toBe(true);
      expect(buttons.some((btn) => btn.getAttribute('title') === 'Copy all output')).toBe(true);
      expect(buttons.some((btn) => btn.getAttribute('title') === 'Clear terminal')).toBe(true);
      expect(buttons.some((btn) => btn.getAttribute('title') === 'Maximize')).toBe(true);
      expect(buttons.some((btn) => btn.getAttribute('title') === 'Close')).toBe(true);
    });

    it('renders custom commands when provided', () => {
      const customCommands: CLICommand[] = [
        { command: 'test', description: 'Test command', category: 'basic' },
      ];
      render(
        createElement(CLIPlayground, {
          tool: 'bash' as CLITool,
          commands: customCommands,
        })
      );
      expect(screen.getByText('test')).toBeDefined();
    });
  });

  describe('Preset Components', () => {
    it('renders ClaudeCLIPlayground preset', () => {
      render(createElement(ClaudeCLIPlayground));
      expect(screen.getByText('Claude CLI Playground')).toBeDefined();
    });

    it('renders CopilotCLIPlayground preset', () => {
      render(createElement(CopilotCLIPlayground));
      expect(screen.getByText('GitHub Copilot CLI Playground')).toBeDefined();
    });

    it('renders OpenCodeCLIPlayground preset', () => {
      render(createElement(OpenCodeCLIPlayground));
      expect(screen.getByText('OpenCode CLI Playground')).toBeDefined();
    });

    it('renders BashTerminal preset', () => {
      render(createElement(BashTerminal));
      expect(screen.getByText('Bash Terminal')).toBeDefined();
    });
  });

  describe('Command Execution - Claude CLI', () => {
    it('executes claude scan command', async () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'claude scan' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Indexed 47 files/)).toBeDefined();
      });
    });

    it('executes claude ask command with dynamic response', async () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'claude ask How do I use React?' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/How do I use React\?/)).toBeDefined();
      });
    });

    it('executes claude chat command', async () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'claude chat' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Starting chat mode/)).toBeDefined();
      });
    });

    it('executes claude --help command', async () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'claude --help' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Available commands:/)).toBeDefined();
      });
    });

    it('shows error for unknown command', async () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'unknown command' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Command not found/)).toBeDefined();
      });
    });

    it('suggests similar commands for unknown command', async () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'claude as' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Did you mean:/)).toBeDefined();
      });
    });
  });

  describe('Command Execution - Copilot CLI', () => {
    it('executes gh copilot suggest command', async () => {
      render(createElement(CLIPlayground, { tool: 'copilot' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'gh copilot suggest find large files' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Suggested command:/)).toBeDefined();
      });
    });

    it('executes gh copilot explain command', async () => {
      render(createElement(CLIPlayground, { tool: 'copilot' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'gh copilot explain ls -lah' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Explaining: ls -lah/)).toBeDefined();
      });
    });

    it('executes gh copilot --help command', async () => {
      render(createElement(CLIPlayground, { tool: 'copilot' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'gh copilot --help' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Available commands:/)).toBeDefined();
      });
    });
  });

  describe('Command Execution - OpenCode CLI', () => {
    it('executes opencode chat command', async () => {
      render(createElement(CLIPlayground, { tool: 'opencode' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'opencode chat help me' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/help me/)).toBeDefined();
      });
    });

    it('executes opencode agent command', async () => {
      render(createElement(CLIPlayground, { tool: 'opencode' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'opencode agent add auth' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Starting autonomous agent/)).toBeDefined();
      });
    });

    it('executes opencode project create command', async () => {
      render(createElement(CLIPlayground, { tool: 'opencode' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'opencode project create my-app' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/my-app/)).toBeDefined();
      });
    });

    it('executes opencode --help command', async () => {
      render(createElement(CLIPlayground, { tool: 'opencode' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'opencode --help' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Available commands:/)).toBeDefined();
      });
    });
  });

  describe('Command Execution - Bash Terminal', () => {
    it('executes ls command', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'ls' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/src\//)).toBeDefined();
      });
    });

    it('executes pwd command', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'pwd' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/\/home\/user\/vibe-wiki/)).toBeDefined();
      });
    });

    it('executes cat command with file argument', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'cat README.md' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/README.md/)).toBeDefined();
      });
    });

    it('executes echo command', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'echo hello world' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText('hello world')).toBeDefined();
      });
    });

    it('executes mkdir command', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'mkdir new-folder' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/new-folder/)).toBeDefined();
      });
    });
  });

  describe('Special Commands', () => {
    it('clears terminal with clear command', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');

      // Execute a command first
      fireEvent.change(textarea, { target: { value: 'ls' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/src\//)).toBeDefined();
      });

      // Clear terminal
      fireEvent.change(textarea, { target: { value: 'clear' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.queryByText(/src\//)).toBeNull();
      });
    });

    it('shows command history with history command', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');

      // Execute some commands
      fireEvent.change(textarea, { target: { value: 'ls' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/src\//)).toBeDefined();
      });

      fireEvent.change(textarea, { target: { value: 'pwd' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      // Show history
      fireEvent.change(textarea, { target: { value: 'history' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/ls/)).toBeDefined();
        expect(screen.getByText(/pwd/)).toBeDefined();
      });
    });

    it('displays help command', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'help' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/Available commands:/)).toBeDefined();
      });
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('clears input with Ctrl+C', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'some command' } });

      expect((textarea as HTMLTextAreaElement).value).toBe('some command');

      fireEvent.keyDown(textarea, { key: 'c', ctrlKey: true });

      await waitFor(() => {
        expect((textarea as HTMLTextAreaElement).value).toBe('');
      });
    });

    it('clears terminal with Ctrl+L', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');

      // Execute a command first
      fireEvent.change(textarea, { target: { value: 'ls' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/src\//)).toBeDefined();
      });

      // Clear with Ctrl+L
      fireEvent.keyDown(textarea, { key: 'l', ctrlKey: true });

      await waitFor(() => {
        expect(screen.queryByText(/src\//)).toBeNull();
      });
    });

    it('navigates command history with ArrowUp', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');

      // Execute a command
      fireEvent.change(textarea, { target: { value: 'ls' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/src\//)).toBeDefined();
      });

      // Navigate up in history
      fireEvent.keyDown(textarea, { key: 'ArrowUp' });

      await waitFor(() => {
        expect((textarea as HTMLTextAreaElement).value).toBe('ls');
      });
    });

    it('navigates command history with ArrowDown', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');

      // Execute a command
      fireEvent.change(textarea, { target: { value: 'ls' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/src\//)).toBeDefined();
      });

      // Navigate up then down
      fireEvent.keyDown(textarea, { key: 'ArrowUp' });
      fireEvent.keyDown(textarea, { key: 'ArrowDown' });

      await waitFor(() => {
        expect((textarea as HTMLTextAreaElement).value).toBe('');
      });
    });

    it('autocompletes commands with Tab', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'l' } });

      fireEvent.keyDown(textarea, { key: 'Tab' });

      await waitFor(() => {
        expect((textarea as HTMLTextAreaElement).value).toBe('ls ');
      });
    });

    it('shows multiple autocomplete options with Tab', async () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'claude' } });

      fireEvent.keyDown(textarea, { key: 'Tab' });

      await waitFor(() => {
        expect(screen.getByText(/claude ask/)).toBeDefined();
      });
    });
  });

  describe('UI Controls', () => {
    it('toggles quick reference sidebar', async () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      const toggleButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Toggle quick reference'
      );

      expect(screen.getByText('Quick Reference')).toBeDefined();

      if (toggleButton) {
        fireEvent.click(toggleButton);

        await waitFor(() => {
          expect(screen.queryByText('Quick Reference')).toBeNull();
        });
      }
    });

    it('clears terminal with clear button', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');

      // Execute a command first
      fireEvent.change(textarea, { target: { value: 'ls' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/src\//)).toBeDefined();
      });

      // Click clear button
      const clearButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Clear terminal'
      );

      if (clearButton) {
        fireEvent.click(clearButton);

        await waitFor(() => {
          expect(screen.queryByText(/src\//)).toBeNull();
        });
      }
    });

    it('copies output to clipboard with copy button', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');

      // Execute a command
      fireEvent.change(textarea, { target: { value: 'ls' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/src\//)).toBeDefined();
      });

      // Click copy button
      const copyButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Copy all output'
      );

      if (copyButton) {
        fireEvent.click(copyButton);

        await waitFor(() => {
          expect(mockClipboard.writeText).toHaveBeenCalled();
        });
      }
    });

    it('maximizes terminal with maximize button', async () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      const maximizeButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Maximize'
      );

      if (maximizeButton) {
        fireEvent.click(maximizeButton);

        await waitFor(() => {
          expect(screen.getAllByRole('button').some(
            (btn) => btn.getAttribute('title') === 'Restore'
          )).toBe(true);
        });
      }
    });

    it('closes terminal with close button when maximized', async () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      // First maximize
      const maximizeButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Maximize'
      );

      if (maximizeButton) {
        fireEvent.click(maximizeButton);

        await waitFor(() => {
          expect(screen.getAllByRole('button').some(
            (btn) => btn.getAttribute('title') === 'Restore'
          )).toBe(true);
        });
      }

      // Now close
      const closeButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Close'
      );

      if (closeButton) {
        fireEvent.click(closeButton);

        await waitFor(() => {
          expect(screen.getAllByRole('button').some(
            (btn) => btn.getAttribute('title') === 'Maximize'
          )).toBe(true);
        });
      }
    });
  });

  describe('Quick Reference', () => {
    it('runs command from quick reference', async () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      // Find quick reference button for 'ls' command
      const quickRefButtons = screen.getAllByRole('button');
      const lsButton = quickRefButtons.find((btn) => btn.textContent?.includes('ls'));

      if (lsButton) {
        fireEvent.click(lsButton);

        await waitFor(() => {
          expect(screen.getByText(/src\//)).toBeDefined();
        });
      }
    });

    it('shows all commands in quick reference for Claude', () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      expect(screen.getByText('claude ask')).toBeDefined();
      expect(screen.getByText('claude analyze')).toBeDefined();
      expect(screen.getByText('claude generate')).toBeDefined();
      expect(screen.getByText('claude refactor')).toBeDefined();
    });

    it('shows all commands in quick reference for Bash', () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      expect(screen.getByText('ls')).toBeDefined();
      expect(screen.getByText('pwd')).toBeDefined();
      expect(screen.getByText('cat')).toBeDefined();
      expect(screen.getByText('mkdir')).toBeDefined();
    });
  });

  describe('Input Handling', () => {
    it('does not execute empty command', () => {
      render(createElement(CLIPlayground, { tool: 'bash' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      const initialHistoryCount = screen.getAllByText(/Bash Terminal/).length;

      fireEvent.change(textarea, { target: { value: '' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      // History should not change
      expect(screen.getAllByText(/Bash Terminal/).length).toBe(initialHistoryCount);
    });

    it('handles multi-word input', async () => {
      render(createElement(CLIPlayground, { tool: 'claude' as CLITool }));

      const textarea = screen.getByPlaceholderText('Type a command...');
      fireEvent.change(textarea, { target: { value: 'claude ask How does React work?' } });
      fireEvent.keyDown(textarea, { key: 'Enter' });

      await waitFor(() => {
        expect(screen.getByText(/How does React work\?/)).toBeDefined();
      });
    });
  });

  describe('Custom Prompts', () => {
    it('uses custom prompt when provided', () => {
      render(
        createElement(CLIPlayground, {
          tool: 'bash' as CLITool,
          prompt: 'custom>',
        })
      );

      // Check that the custom prompt appears in the terminal header
      const prompts = screen.getAllByText('custom>');
      expect(prompts.length).toBeGreaterThan(0);
    });
  });
});
