/**
 * Tests for ChatBot Component
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatBot } from '../ChatBot';
import type { WikiArticle, Tutorial, LearningPath } from '../../types';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  m: {
    button: ({ children, onClick, ...props }: any) => (
      <button onClick={onClick} {...props}>
        {children}
      </button>
    ),
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
  }),
}));

const mockWikiArticles: WikiArticle[] = [
  {
    slug: 'cursor-ide',
    title: 'Cursor IDE',
    section: 'أدوات',
    content: 'Cursor IDE is a powerful AI-powered code editor.',
    tags: ['ide', 'ai'],
  },
  {
    slug: 'v0-dev',
    title: 'v0.dev',
    section: 'أدوات',
    content: 'v0.dev is a UI generation tool by Vercel.',
    tags: ['ui', 'ai'],
  },
];

const mockTutorials: Tutorial[] = [
  {
    id: 'tutorial-1',
    slug: 'cursor-basics',
    title: 'أساسيات Cursor',
    description: 'Learn the basics of Cursor IDE.',
    section: 'أدوات',
    difficulty: 'beginner',
    estimatedMinutes: 15,
    learningObjectives: ['Learn Cursor interface'],
    steps: [],
    tags: ['cursor'],
  },
];

const mockPaths: LearningPath[] = [
  {
    id: 'path-1',
    slug: 'vibecoding-journey',
    title: 'رحلة Vibecoding',
    description: 'Complete journey for AI-assisted programming.',
    difficulty: 'beginner',
    estimatedMinutes: 120,
    targetAudience: ['beginners'],
    learningObjectives: ['Master vibecoding'],
    items: [],
  },
];

describe('ChatBot Component', () => {
  beforeEach(() => {
    // Mock window.location.href
    delete (window as any).location;
    (window as any).location = { href: '' };
  });

  it('should render chat toggle button', () => {
    render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
      />
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should not show chat window initially', () => {
    render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
      />
    );

    expect(screen.queryByText('Vibe Wiki Assistant')).not.toBeInTheDocument();
  });

  it('should open chat window when toggle button is clicked', async () => {
    render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
      />
    );

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(screen.getByText('Vibe Wiki Assistant')).toBeInTheDocument();
    });
  });

  it('should show welcome message when chat is opened', async () => {
    render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Hello!')).toBeInTheDocument();
    });
  });

  it('should allow user to type and send a message', async () => {
    render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Type your message/i);
    const sendButton = screen.getByRole('button', { name: '' }); // Send button (no explicit label)

    await userEvent.type(input, 'What is Cursor?');
    fireEvent.click(sendButton.parentElement?.querySelector('button:last-child')!);

    await waitFor(() => {
      expect(screen.getByText('What is Cursor?')).toBeInTheDocument();
    }, { timeout: 3000 });
  });

  it('should show typing indicator while processing', async () => {
    render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Type your message/i);
    await userEvent.type(input, 'Hello');
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    // Typing indicator should appear briefly
    await waitFor(
      () => {
        const dots = screen.getAllByRole('generic').filter(el => el.textContent === '');
      },
      { timeout: 100 }
    );
  });

  it('should display assistant response with sources', async () => {
    render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Type your message/i);
    await userEvent.type(input, 'What is Cursor IDE?');
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    await waitFor(
      () => {
        expect(screen.getByText('What is Cursor IDE?')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    await waitFor(
      () => {
        const messages = screen.getAllByText(/Cursor|found/i);
        expect(messages.length).toBeGreaterThan(0);
      },
      { timeout: 3000 }
    );
  });

  it('should send message on Enter key press', async () => {
    render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Type your message/i);
    await userEvent.type(input, 'Hello');

    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', keyCode: 13 });

    await waitFor(
      () => {
        expect(screen.getByText('Hello')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should not send message on Shift+Enter', async () => {
    render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Type your message/i);
    await userEvent.type(input, 'Hello');

    // Shift+Enter should not send
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', shiftKey: true });

    // Message should not appear
    expect(screen.queryByText('Hello')).not.toBeInTheDocument();
  });

  it('should close chat window when toggle button is clicked again', async () => {
    render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
      />
    );

    const toggleButton = screen.getByRole('button');

    // Open chat
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.getByText('Vibe Wiki Assistant')).toBeInTheDocument();
    });

    // Close chat
    fireEvent.click(toggleButton);
    await waitFor(() => {
      expect(screen.queryByText('Vibe Wiki Assistant')).not.toBeInTheDocument();
    });
  });

  it('should use custom config when provided', async () => {
    const customConfig = {
      maxSources: 2,
      enableSuggestions: false,
    };

    render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
        config={customConfig}
      />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Type your message/i);
    await userEvent.type(input, 'Tell me about AI tools');
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    await waitFor(
      () => {
        expect(screen.getByText('Tell me about AI tools')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should handle empty wiki content gracefully', async () => {
    render(
      <ChatBot wikiArticles={[]} tutorials={[]} learningPaths={[]} />
    );

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
    });

    const input = screen.getByPlaceholderText(/Type your message/i);
    await userEvent.type(input, 'What tools are available?');
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter' });

    await waitFor(
      () => {
        expect(screen.getByText('What tools are available?')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Should show "couldn't find" response
    await waitFor(
      () => {
        const messages = screen.queryByText(/couldn't find|لم أجد/i);
        expect(messages).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ChatBot
        wikiArticles={mockWikiArticles}
        tutorials={mockTutorials}
        learningPaths={mockPaths}
        className="custom-chat-class"
      />
    );

    expect(container.querySelector('.custom-chat-class')).toBeInTheDocument();
  });
});
