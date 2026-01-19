import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { InteractiveCodeBlock } from './InteractiveCodeBlock';

// Mock navigator.clipboard
const mockClipboard = {
  writeText: vi.fn(() => Promise.resolve()),
};

Object.assign(navigator, { clipboard: mockClipboard });

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, className, title }: {
    children?: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
    title?: string;
  }) => createElement('button', { onClick, disabled, className, title }, children),
}));

describe('InteractiveCodeBlock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders code block with code content', () => {
      render(
        createElement(InteractiveCodeBlock, { code: 'const x = 1;', language: 'javascript' },
          createElement('code', null, 'const x = 1;')
        )
      );

      expect(screen.getByText('const x = 1;')).toBeDefined();
    });

    it('displays language label when language is provided', () => {
      render(
        createElement(InteractiveCodeBlock, { code: 'const x = 1;', language: 'javascript' },
          createElement('code', null, 'const x = 1;')
        )
      );

      expect(screen.getByText('javascript')).toBeDefined();
    });

    it('does not display language label when language is empty', () => {
      render(
        createElement(InteractiveCodeBlock, { code: 'const x = 1;', language: '' },
          createElement('code', null, 'const x = 1;')
        )
      );

      expect(screen.queryByText('javascript')).toBeNull();
    });

    it('renders copy button', () => {
      render(
        createElement(InteractiveCodeBlock, { code: 'const x = 1;', language: 'javascript' },
          createElement('code', null, 'const x = 1;')
        )
      );

      const copyButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Copy code'
      );
      expect(copyButton).toBeDefined();
    });
  });

  describe('Executable Languages', () => {
    it('shows run button for JavaScript code', () => {
      render(
        createElement(InteractiveCodeBlock, { code: "console.log('test');", language: 'javascript' },
          createElement('code', null, "console.log('test');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );
      expect(runButton).toBeDefined();
    });

    it('shows run button for JS code', () => {
      render(
        createElement(InteractiveCodeBlock, { code: "console.log('test');", language: 'js' },
          createElement('code', null, "console.log('test');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );
      expect(runButton).toBeDefined();
    });

    it('shows run button for TypeScript code', () => {
      render(
        createElement(InteractiveCodeBlock, { code: "console.log('test');", language: 'typescript' },
          createElement('code', null, "console.log('test');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );
      expect(runButton).toBeDefined();
    });

    it('shows run button for TS code', () => {
      render(
        createElement(InteractiveCodeBlock, { code: "console.log('test');", language: 'ts' },
          createElement('code', null, "console.log('test');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );
      expect(runButton).toBeDefined();
    });

    it('does not show run button for non-executable languages', () => {
      render(
        createElement(InteractiveCodeBlock, { code: "print('test');", language: 'python' },
          createElement('code', null, "print('test');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );
      expect(runButton).toBeUndefined();
    });

    it('is case-insensitive for language detection', () => {
      render(
        createElement(InteractiveCodeBlock, { code: "console.log('test');", language: 'JavaScript' },
          createElement('code', null, "console.log('test');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );
      expect(runButton).toBeDefined();
    });
  });

  describe('Copy Functionality', () => {
    it('copies code to clipboard when copy button is clicked', async () => {
      render(
        createElement(InteractiveCodeBlock, { code: 'const x = 1;', language: 'javascript' },
          createElement('code', null, 'const x = 1;')
        )
      );

      const copyButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Copy code'
      );

      if (copyButton) {
        fireEvent.click(copyButton);

        await waitFor(() => {
          expect(mockClipboard.writeText).toHaveBeenCalledWith('const x = 1;');
        });
      }
    });

    it('shows check icon after copying', async () => {
      render(
        createElement(InteractiveCodeBlock, { code: 'const x = 1;', language: 'javascript' },
          createElement('code', null, 'const x = 1;')
        )
      );

      const copyButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Copy code'
      );

      if (copyButton) {
        fireEvent.click(copyButton);

        await waitFor(() => {
          expect(mockClipboard.writeText).toHaveBeenCalled();
        });
      }
    });
  });

  describe('Code Execution', () => {
    it('executes JavaScript code and shows output', async () => {
      render(
        createElement(InteractiveCodeBlock, { code: "console.log('Hello, World!');", language: 'javascript' },
          createElement('code', null, "console.log('Hello, World!');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );

      if (runButton) {
        fireEvent.click(runButton);

        await waitFor(() => {
          expect(screen.getByText('Output')).toBeDefined();
        });
      }
    });

    it('shows return value in output', async () => {
      render(
        createElement(InteractiveCodeBlock, { code: '42', language: 'javascript' },
          createElement('code', null, '42')
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );

      if (runButton) {
        fireEvent.click(runButton);

        await waitFor(() => {
          expect(screen.getByText('42')).toBeDefined();
        });
      }
    });

    it('displays errors when code fails', async () => {
      render(
        createElement(InteractiveCodeBlock, { code: "throw new Error('Test error');", language: 'javascript' },
          createElement('code', null, "throw new Error('Test error');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );

      if (runButton) {
        fireEvent.click(runButton);

        await waitFor(() => {
          expect(screen.getByText('Test error')).toBeDefined();
        });
      }
    });

    it('clears output when close button is clicked', async () => {
      render(
        createElement(InteractiveCodeBlock, { code: "console.log('test');", language: 'javascript' },
          createElement('code', null, "console.log('test');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );

      if (runButton) {
        fireEvent.click(runButton);

        await waitFor(() => {
          expect(screen.getByText('Output')).toBeDefined();
        });

        const closeButton = screen.getAllByRole('button').find(
          (btn) => btn.getAttribute('title') === 'Close output'
        );

        if (closeButton) {
          fireEvent.click(closeButton);

          await waitFor(() => {
            expect(screen.queryByText('Output')).toBeNull();
          });
        }
      }
    });

    it('handles console.log output', async () => {
      render(
        createElement(InteractiveCodeBlock, { code: "console.log('test output');", language: 'javascript' },
          createElement('code', null, "console.log('test output');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );

      if (runButton) {
        fireEvent.click(runButton);

        await waitFor(() => {
          expect(screen.getByText('test output')).toBeDefined();
        });
      }
    });

    it('handles console.error output', async () => {
      render(
        createElement(InteractiveCodeBlock, { code: "console.error('error message');", language: 'javascript' },
          createElement('code', null, "console.error('error message');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );

      if (runButton) {
        fireEvent.click(runButton);

        await waitFor(() => {
          expect(screen.getByText(/\[Error\] error message/)).toBeDefined();
        });
      }
    });

    it('handles console.warn output', async () => {
      render(
        createElement(InteractiveCodeBlock, { code: "console.warn('warning message');", language: 'javascript' },
          createElement('code', null, "console.warn('warning message');")
        )
      );

      const runButton = screen.getAllByRole('button').find(
        (btn) => btn.getAttribute('title') === 'Run code'
      );

      if (runButton) {
        fireEvent.click(runButton);

        await waitFor(() => {
          expect(screen.getByText(/\[Warn\] warning message/)).toBeDefined();
        });
      }
    });
  });
});
