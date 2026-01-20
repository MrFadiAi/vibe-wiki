"use client";

import * as React from "react";
import { Terminal, X, Maximize2, Minimize2, Copy, Check, History, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type CLITool = "claude" | "copilot" | "opencode" | "bash";

export interface CLICommand {
  command: string;
  description: string;
  category: "basic" | "intermediate" | "advanced";
  response?: string;
  responseGenerator?: (args: string[]) => string;
  tool?: CLITool;
}

export interface CLIPlaygroundConfig {
  tool: CLITool;
  title?: string;
  welcomeMessage?: string;
  prompt?: string;
  commands?: CLICommand[];
  showQuickReference?: boolean;
  maxHeight?: string;
}

export interface TerminalHistory {
  command: string;
  output: string;
  timestamp: Date;
  success: boolean;
}

export interface TerminalState {
  history: TerminalHistory[];
  currentInput: string;
  cursorPosition: number;
  commandHistory: string[];
  historyIndex: number;
  isMaximized: boolean;
  showQuickRef: boolean;
}

// ============================================================================
// DEFAULT COMMAND SETS FOR EACH TOOL
// ============================================================================

const CLAUDE_COMMANDS: CLICommand[] = [
  {
    command: "claude ask",
    description: "Ask Claude a question",
    category: "basic",
    responseGenerator: (args) => {
      const query = args.join(" ");
      return `[Claude] Here's what I found about "${query}":\n\nBased on your query, I'd suggest:\n1. Review the project structure\n2. Check the documentation\n3. Consider the best practices for this use case\n\nWould you like me to elaborate on any of these points?`;
    },
  },
  {
    command: "claude analyze",
    description: "Analyze a file or directory",
    category: "basic",
    responseGenerator: (args) => {
      const target = args[0] || ".";
      return `[Claude] Analyzing ${target}...\n\n📁 Structure:\n├── src/ (12 files)\n├── tests/ (5 files)\n└── package.json\n\n📊 Summary:\n- Languages: TypeScript, JavaScript\n- Total lines: 1,247\n- Complexity: Low-Medium\n\n💡 Suggestions:\n- Consider adding more test coverage\n- Some functions could be extracted for reusability`;
    },
  },
  {
    command: "claude generate",
    description: "Generate code from description",
    category: "basic",
    responseGenerator: (args) => {
      const desc = args.join(" ");
      return `[Claude] Generating code for: ${desc}\n\n\`\`\`typescript\nfunction ${desc.replace(/\s+/g, "").toLowerCase()}() {\n  // Implementation generated\n  const result = processData();\n  return result;\n}\n\`\`\`\n\n✅ Code generated! Review and let me know if you need changes.`;
    },
  },
  {
    command: "claude refactor",
    description: "Refactor code to improve quality",
    category: "intermediate",
    responseGenerator: (args) => {
      const target = args[0] || "code";
      return `[Claude] Refactoring ${target}...\n\nChanges applied:\n✓ Extracted duplicate logic into helper functions\n✓ Improved variable naming\n✓ Added TypeScript types\n✓ Optimized performance\n\n📝 Review the changes and run tests to verify.`;
    },
  },
  {
    command: "claude debug",
    description: "Debug errors with AI assistance",
    category: "intermediate",
    responseGenerator: (args) => {
      const error = args.join(" ") || "TypeError";
      return `[Claude] Analyzing error: ${error}\n\n🔍 Root Cause:\nThe issue appears to be in the data transformation layer.\n\n🛠️ Suggested Fix:\n\`\`\`typescript\n// Add null check\nif (data && typeof data === 'object') {\n  return transform(data);\n}\n\`\`\`\n\n✨ This should resolve the issue. Let me know if you need more help!`;
    },
  },
  {
    command: "claude scan",
    description: "Scan and index project files",
    category: "basic",
    response: `[Claude] Scanning project...\n\n✓ Indexed 47 files\n✓ Found 12 TypeScript files\n✓ Found 8 configuration files\n✓ Detected framework: Next.js 14\n✓ Detected styling: Tailwind CSS\n\n🎯 Project context loaded! I now understand your codebase structure.`,
  },
  {
    command: "claude review",
    description: "Review code for improvements",
    category: "intermediate",
    responseGenerator: (args) => {
      const file = args[0] || "src/index.ts";
      return `[Claude] Reviewing ${file}...\n\n📋 Code Review Results:\n\n✅ Strengths:\n- Clean code structure\n- Good use of TypeScript\n- Proper error handling\n\n⚠️ Suggestions:\n- Add JSDoc comments for public APIs\n- Consider edge cases in validation\n- Extract magic numbers to constants\n\nOverall: 8.5/10 - Well written!`;
    },
  },
  {
    command: "claude chat",
    description: "Start interactive conversation",
    category: "basic",
    response: `[Claude] Starting chat mode...\n\n💬 You can now ask me anything about your code!\n\nType 'exit' to leave chat mode.\n\n[Claude] Hello! How can I help you today?`,
  },
  {
    command: "claude config set",
    description: "Configure Claude CLI settings",
    category: "advanced",
    responseGenerator: (args) => {
      const key = args[0] || "model";
      const value = args[1] || "claude-3-5-sonnet";
      return `[Claude] Configuration updated:\n  ${key} = ${value}\n\n✅ Settings saved to ~/.claude/config.json`;
    },
  },
  {
    command: "claude --help",
    description: "Show help information",
    category: "basic",
    response: `[Claude CLI] v1.2.0\n\nAvailable commands:\n  ask          Ask a question\n  analyze      Analyze files\n  generate     Generate code\n  refactor     Refactor code\n  debug        Debug errors\n  scan         Scan project\n  review       Review code\n  chat         Interactive chat\n  config       Configure settings\n\nOptions:\n  --help       Show this help\n  --version    Show version`,
  },
];

const COPILOT_COMMANDS: CLICommand[] = [
  {
    command: "gh copilot suggest",
    description: "Suggest terminal commands",
    category: "basic",
    responseGenerator: (args) => {
      const query = args.join(" ") || "list files";
      return `[Copilot] Suggesting command for: ${query}\n\n💡 Suggested command:\n\`\`\`bash\nls -lah\n\`\`\`\n\n📝 This command lists all files with details including hidden files.\n\nPress Enter to execute, or Ctrl+C to cancel.`;
    },
  },
  {
    command: "gh copilot explain",
    description: "Explain a command",
    category: "basic",
    responseGenerator: (args) => {
      const cmd = args[0] || "ls -lah";
      return `[Copilot] Explaining: ${cmd}\n\n📖 Breakdown:\n- ls: list directory contents\n- -l: use long listing format\n- -a: include hidden files (starting with .)\n- -h: human-readable file sizes\n\n✨ This command provides a detailed view of all files in a human-readable format.`;
    },
  },
  {
    command: "gh copilot suggest -s",
    description: "Suggest for specific shell",
    category: "intermediate",
    responseGenerator: (args) => {
      const shell = args[0] || "bash";
      const query = args.slice(1).join(" ") || "compress files";
      return `[Copilot] Shell: ${shell} | Query: ${query}\n\n💡 Suggested command:\n\`\`\`${shell}\ntar -czf archive.tar.gz folder/\n\`\`\`\n\n📝 This creates a compressed archive of the specified folder.`;
    },
  },
  {
    command: "gh copilot --help",
    description: "Show help information",
    category: "basic",
    response: `[GitHub Copilot CLI] v2.1.0\n\nAvailable commands:\n  suggest      Suggest commands\n  explain      Explain commands\n\nOptions:\n  -s <shell>   Target shell (bash, zsh, powershell)\n  --detailed   Show detailed explanations\n  --help       Show this help`,
  },
];

const OPENCODE_COMMANDS: CLICommand[] = [
  {
    command: "opencode chat",
    description: "Chat with OpenCode AI",
    category: "basic",
    responseGenerator: (args) => {
      const query = args.join(" ") || "hello";
      return `[OpenCode] ${query}\n\n🤖 I'm OpenCode, your open-source AI coding assistant!\n\nI can help you with:\n• Code generation and refactoring\n• Multi-file operations\n• Test generation\n• Debugging\n• Documentation\n\nHow can I assist you today?`;
    },
  },
  {
    command: "opencode project create",
    description: "Create a new project",
    category: "intermediate",
    responseGenerator: (args) => {
      const name = args[0] || "my-project";
      return `[OpenCode] Creating project: ${name}\n\n✓ Initialized project structure\n✓ Created package.json\n✓ Set up TypeScript config\n✓ Added ESLint & Prettier\n✓ Generated README.md\n\n🎉 Project "${name}" created successfully!\n\nNext steps:\n1. cd ${name}\n2. npm install\n3. opencode chat "Add a home page"`;
    },
  },
  {
    command: "opencode agent",
    description: "Run autonomous agent for complex tasks",
    category: "advanced",
    responseGenerator: (args) => {
      const task = args.join(" ") || "add authentication";
      return `[OpenCode] Starting autonomous agent...\n\n🤖 Agent Workflow:\n\n  [Planner] Breaking down task: ${task}\n  ├─ Analyze requirements\n  ├─ Design solution\n  └─ Plan implementation\n  ✓ Planning complete\n\n  [Coder] Implementing solution...\n  ├─ Create auth utilities\n  ├─ Add middleware\n  ├─ Update routes\n  └─ Add tests\n  ✓ Implementation complete\n\n  [Reviewer] Reviewing code...\n  ├─ Check best practices\n  ├─ Verify security\n  └─ Validate types\n  ✓ Review passed\n\n  [Tester] Running tests...\n  ├─ Unit tests: ✓ 12/12 passed\n  ├─ Integration tests: ✓ 5/5 passed\n  └─ E2E tests: ✓ 3/3 passed\n  ✓ All tests passed\n\n🎉 Task completed successfully!`;
    },
  },
  {
    command: "opencode refactor",
    description: "Refactor code with AI",
    category: "intermediate",
    responseGenerator: (args) => {
      const target = args[0] || "src/";
      return `[OpenCode] Refactoring ${target}\n\n🔍 Analysis:\n- Found 8 files to refactor\n- Identified patterns to improve\n\n✅ Changes applied:\n✓ Converted class components to functional\n✓ Added React hooks where appropriate\n✓ Improved type definitions\n✓ Enhanced error handling\n\n📊 Results:\n- Lines of code: -15%\n- Type coverage: +25%\n- Test coverage: maintained at 85%`;
    },
  },
  {
    command: "opencode config",
    description: "Configure OpenCode settings",
    category: "advanced",
    response: `[OpenCode] Configuration\n\nCurrent settings:\n  Provider: Anthropic (Claude)\n  Model: claude-3-opus\n  Temperature: 0.2\n  Max Tokens: 4000\n\nAgents:\n  Planner: claude-3-opus\n  Coder: claude-3-sonnet\n  Reviewer: claude-3-sonnet\n\nUse 'opencode config set <key> <value>' to modify.`,
  },
  {
    command: "opencode --help",
    description: "Show help information",
    category: "basic",
    response: `[OpenCode CLI] v3.0.0 - Open Source AI Coding Assistant\n\nAvailable commands:\n  chat         Interactive chat\n  agent        Autonomous AI agent\n  project      Project management\n  refactor     Refactor code\n  debug        Debug errors\n  review       Code review\n  config       Configuration\n\nOptions:\n  --help       Show this help\n  --version    Show version\n  --local      Use local models`,
  },
];

const BASH_COMMANDS: CLICommand[] = [
  {
    command: "ls",
    description: "List directory contents",
    category: "basic",
    response: `src/  public/  package.json  tsconfig.json  README.md`,
  },
  {
    command: "pwd",
    description: "Print working directory",
    category: "basic",
    response: `/home/user/vibe-wiki`,
  },
  {
    command: "cat",
    description: "Display file contents",
    category: "basic",
    responseGenerator: (args) => {
      const file = args[0] || "README.md";
      return `# Vibe Wiki\n\nAn interactive wiki for AI coding education.\n\n## Getting Started\n\n1. Install dependencies: npm install\n2. Run dev server: npm run dev\n3. Open http://localhost:3000\n\n... (content of ${file})`;
    },
  },
  {
    command: "mkdir",
    description: "Create directory",
    category: "basic",
    responseGenerator: (args) => {
      const dir = args[0] || "new-folder";
      return `Directory '${dir}' created successfully.`;
    },
  },
  {
    command: "echo",
    description: "Display text",
    category: "basic",
    responseGenerator: (args) => args.join(" ") || "",
  },
  {
    command: "clear",
    description: "Clear terminal screen",
    category: "basic",
    response: "", // Special handling
  },
  {
    command: "history",
    description: "Show command history",
    category: "basic",
    response: "", // Special handling
  },
  {
    command: "help",
    description: "Show help",
    category: "basic",
    response: `Available commands:\n  ls      List directory\n  pwd     Print working directory\n  cat     Show file contents\n  mkdir   Create directory\n  echo    Print text\n  clear   Clear terminal\n  history Command history`,
  },
];

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getCommandsForTool(tool: CLITool): CLICommand[] {
  switch (tool) {
    case "claude":
      return CLAUDE_COMMANDS;
    case "copilot":
      return COPILOT_COMMANDS;
    case "opencode":
      return OPENCODE_COMMANDS;
    case "bash":
      return BASH_COMMANDS;
    default:
      return [];
  }
}

function getDefaultPrompt(tool: CLITool): string {
  switch (tool) {
    case "claude":
      return "claude";
    case "copilot":
      return "gh copilot";
    case "opencode":
      return "opencode";
    case "bash":
      return "$";
    default:
      return "$";
  }
}

function getDefaultWelcomeMessage(tool: CLITool): string {
  switch (tool) {
    case "claude":
      return `Welcome to Claude CLI! 🤖\n\nType 'claude --help' to see available commands.\nTry commands like:\n  claude ask "How do I implement async/await?"\n  claude analyze src/\n  claude generate "a React counter component"\n`;
    case "copilot":
      return `Welcome to GitHub Copilot CLI! 🐙\n\nType 'gh copilot --help' to see available commands.\nTry commands like:\n  gh copilot suggest "find all large files"\n  gh copilot explain "docker-compose up -d"\n`;
    case "opencode":
      return `Welcome to OpenCode CLI! 🚀\n\nType 'opencode --help' to see available commands.\nTry commands like:\n  opencode chat "Add a login form"\n  opencode agent "Create a todo app"\n  opencode refactor src/\n`;
    case "bash":
      return `Bash Terminal - Practice common commands 💻\n\nType 'help' to see available commands.\n`;
    default:
      return "Terminal ready.";
  }
}

function findMatchingCommands(input: string, commands: CLICommand[]): CLICommand[] {
  const normalizedInput = input.toLowerCase().trim();
  return commands.filter(
    (cmd) =>
      cmd.command.toLowerCase().startsWith(normalizedInput) ||
      cmd.description.toLowerCase().includes(normalizedInput)
  );
}

function executeCommand(input: string, commands: CLICommand[]): string {
  const trimmedInput = input.trim();
  const parts = trimmedInput.split(/\s+/);
  const commandBase = parts.slice(0, 2).join(" "); // Handle "gh copilot", "claude ask", etc.
  const singleCommand = parts[0];
  const args = parts.slice(1);

  // Find matching command
  const matchingCommand = commands.find(
    (cmd) =>
      cmd.command === trimmedInput ||
      cmd.command === commandBase ||
      cmd.command === singleCommand ||
      trimmedInput.startsWith(cmd.command + " ")
  );

  if (!matchingCommand) {
    const similarCommands = findMatchingCommands(trimmedInput, commands);
    if (similarCommands.length > 0) {
      return `Command not found. Did you mean:\n${similarCommands
        .slice(0, 3)
        .map((c) => `  • ${c.command} - ${c.description}`)
        .join("\n")}\n\nType 'help' for available commands.`;
    }
    return `Command not found: ${trimmedInput}\nType 'help' for available commands.`;
  }

  // Handle special commands
  if (matchingCommand.command === "clear") {
    return "__CLEAR__";
  }

  if (matchingCommand.command === "history") {
    return "__HISTORY__";
  }

  // Return response or generate from responseGenerator
  if (matchingCommand.responseGenerator) {
    // Extract args after the command
    const cmdParts = matchingCommand.command.split(" ");
    const cmdArgs = parts.slice(cmdParts.length);
    return matchingCommand.responseGenerator(cmdArgs);
  }

  return matchingCommand.response || "";
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CLIPlayground({
  tool,
  title,
  welcomeMessage,
  prompt,
  commands,
  showQuickReference = true,
  maxHeight = "600px",
}: CLIPlaygroundConfig) {
  const defaultCommands = React.useMemo(() => getCommandsForTool(tool), [tool]);
  const allCommands = commands || defaultCommands;
  const defaultPrompt = prompt || getDefaultPrompt(tool);
  const defaultWelcome = welcomeMessage || getDefaultWelcomeMessage(tool);

  const [state, setState] = React.useState<TerminalState>({
    history: [
      {
        command: "",
        output: defaultWelcome,
        timestamp: new Date(),
        success: true,
      },
    ],
    currentInput: "",
    cursorPosition: 0,
    commandHistory: [],
    historyIndex: -1,
    isMaximized: false,
    showQuickRef: showQuickReference,
  });

  const inputRef = React.useRef<HTMLTextAreaElement>(null);
  const terminalRef = React.useRef<HTMLDivElement>(null);

  // Focus input on mount and when clicking terminal
  React.useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-scroll to bottom when history changes
  React.useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [state.history]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setState((prev) => ({ ...prev, currentInput: e.target.value }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle special keys
    if (e.key === "Enter") {
      e.preventDefault();
      if (state.currentInput.trim()) {
        executeAndAddToHistory(state.currentInput);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      navigateHistory("up");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      navigateHistory("down");
    } else if (e.key === "Tab") {
      e.preventDefault();
      autoComplete();
    } else if (e.key === "c" && e.ctrlKey) {
      e.preventDefault();
      setState((prev) => ({ ...prev, currentInput: "" }));
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      clearTerminal();
    }
  };

  const executeAndAddToHistory = (input: string) => {
    const output = executeCommand(input, allCommands);

    // Handle special responses
    if (output === "__CLEAR__") {
      clearTerminal();
      return;
    }

    if (output === "__HISTORY__") {
      const historyOutput = state.commandHistory
        .map((cmd, i) => `  ${i + 1}  ${cmd}`)
        .join("\n");
      setState((prev) => ({
        ...prev,
        history: [
          ...prev.history,
          {
            command: input,
            output: historyOutput || "No commands in history.",
            timestamp: new Date(),
            success: true,
          },
        ],
        currentInput: "",
        commandHistory: [...prev.commandHistory, input],
        historyIndex: prev.commandHistory.length,
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      history: [
        ...prev.history,
        {
          command: input,
          output,
          timestamp: new Date(),
          success: !output.includes("Command not found"),
        },
      ],
      currentInput: "",
      commandHistory: [...prev.commandHistory, input],
      historyIndex: prev.commandHistory.length,
    }));
  };

  const navigateHistory = (direction: "up" | "down") => {
    setState((prev) => {
      if (direction === "up") {
        const newIndex = Math.max(-1, prev.historyIndex - 1);
        if (newIndex >= 0) {
          return {
            ...prev,
            currentInput: prev.commandHistory[newIndex],
            historyIndex: newIndex,
          };
        }
      } else {
        const newIndex = Math.min(prev.commandHistory.length, prev.historyIndex + 1);
        if (newIndex < prev.commandHistory.length) {
          return {
            ...prev,
            currentInput: prev.commandHistory[newIndex],
            historyIndex: newIndex,
          };
        } else {
          return {
            ...prev,
            currentInput: "",
            historyIndex: prev.commandHistory.length,
          };
        }
      }
      return prev;
    });
  };

  const autoComplete = () => {
    const matches = findMatchingCommands(state.currentInput, allCommands);
    if (matches.length === 1) {
      setState((prev) => ({ ...prev, currentInput: matches[0].command + " " }));
    } else if (matches.length > 1) {
      const options = matches.map((m) => m.command).join("  ");
      setState((prev) => ({
        ...prev,
        history: [
          ...prev.history,
          {
            command: state.currentInput,
            output: options,
            timestamp: new Date(),
            success: true,
          },
        ],
      }));
    }
  };

  const clearTerminal = () => {
    setState((prev) => ({
      ...prev,
      history: [],
      currentInput: "",
    }));
  };

  const toggleMaximize = () => {
    setState((prev) => ({ ...prev, isMaximized: !prev.isMaximized }));
  };

  const toggleQuickRef = () => {
    setState((prev) => ({ ...prev, showQuickRef: !prev.showQuickRef }));
  };

  const copyOutput = () => {
    const text = state.history
      .map((h) => `${defaultPrompt} ${h.command}\n${h.output}`)
      .join("\n\n");
    navigator.clipboard.writeText(text);
  };

  const runQuickCommand = (command: string) => {
    setState((prev) => ({ ...prev, currentInput: command }));
    setTimeout(() => executeAndAddToHistory(command), 100);
  };

  const getTitle = () => {
    if (title) return title;
    switch (tool) {
      case "claude":
        return "Claude CLI Playground";
      case "copilot":
        return "GitHub Copilot CLI Playground";
      case "opencode":
        return "OpenCode CLI Playground";
      case "bash":
        return "Bash Terminal";
      default:
        return "CLI Playground";
    }
  };

  const getToolColor = () => {
    switch (tool) {
      case "claude":
        return "text-neon-purple";
      case "copilot":
        return "text-neon-cyan";
      case "opencode":
        return "text-orange-400";
      case "bash":
        return "text-zinc-400";
      default:
        return "text-zinc-400";
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col rounded-xl border border-white/10 bg-zinc-950 overflow-hidden transition-all duration-300",
        state.isMaximized
          ? "fixed inset-4 z-50"
          : "w-full"
      )}
      style={{ maxHeight: state.isMaximized ? "none" : maxHeight }}
    >
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Terminal className={cn("h-5 w-5", getToolColor())} />
          <h3 className="font-semibold text-zinc-100">{getTitle()}</h3>
          <span className="px-2 py-0.5 text-xs font-mono text-zinc-400 bg-zinc-800 rounded">
            {tool.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            onClick={toggleQuickRef}
            title="Toggle quick reference"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            onClick={copyOutput}
            title="Copy all output"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            onClick={clearTerminal}
            title="Clear terminal"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            onClick={toggleMaximize}
            title={state.isMaximized ? "Restore" : "Maximize"}
          >
            {state.isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-zinc-400 hover:text-zinc-100"
            onClick={() => setState((prev) => ({ ...prev, isMaximized: false }))}
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Terminal Output */}
        <div
          ref={terminalRef}
          className="flex-1 overflow-y-auto p-4 font-mono text-sm"
          onClick={() => inputRef.current?.focus()}
        >
          {state.history.map((entry, index) => (
            <div key={index} className="mb-4">
              {entry.command && (
                <div className="flex items-start gap-2 mb-1">
                  <span className={cn("font-semibold", getToolColor())}>
                    {defaultPrompt}
                  </span>
                  <span className="text-zinc-100">{entry.command}</span>
                </div>
              )}
              {entry.output && (
                <div
                  className={cn(
                    "whitespace-pre-wrap pl-4",
                    entry.success ? "text-zinc-300" : "text-red-400"
                  )}
                >
                  {entry.output}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Quick Reference Sidebar */}
        {state.showQuickRef && (
          <div className="w-64 border-l border-white/10 bg-zinc-900/50 p-4 overflow-y-auto">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">
              Quick Reference
            </h4>
            <div className="space-y-2">
              {allCommands.map((cmd, index) => (
                <button
                  key={index}
                  className="w-full text-left p-2 rounded hover:bg-white/5 transition-colors group"
                  onClick={() => runQuickCommand(cmd.command)}
                >
                  <div className="font-mono text-xs text-zinc-300 group-hover:text-neon-cyan">
                    {cmd.command}
                  </div>
                  <div className="text-xs text-zinc-500 mt-0.5">{cmd.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border-t border-white/10">
        <span className={cn("font-mono font-semibold", getToolColor())}>
          {defaultPrompt}
        </span>
        <textarea
          ref={inputRef}
          value={state.currentInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent border-none outline-none text-zinc-100 font-mono text-sm resize-none"
          rows={1}
          placeholder="Type a command..."
          style={{ minHeight: "24px" }}
        />
        <div className="text-xs text-zinc-500">
          Enter: execute • Tab: autocomplete • ↑↓: history • Ctrl+L: clear
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

export function ClaudeCLIPlayground() {
  return <CLIPlayground tool="claude" />;
}

export function CopilotCLIPlayground() {
  return <CLIPlayground tool="copilot" />;
}

export function OpenCodeCLIPlayground() {
  return <CLIPlayground tool="opencode" />;
}

export function BashTerminal() {
  return <CLIPlayground tool="bash" />;
}
