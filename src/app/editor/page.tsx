'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Settings2,
  Sparkles,
  ChevronDown,
  Code2,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Cpu,
  Trash2,
  Layers,
  Activity,
  Zap,
} from 'lucide-react';

// Dynamically import Monaco Editor to prevent SSR window issues
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1e1e1e] text-neutral-400 space-y-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono">Initializing VS Code Engine...</span>
    </div>
  ),
});

interface LanguageOption {
  id: 'c' | 'cpp' | 'python' | 'rust' | 'javascript' | 'typescript' | 'go';
  name: string;
  monacoLang: string;
  badge: string;
  iconText: string;
  compilerName: string;
  defaultCode: string;
}

const LANGUAGES: LanguageOption[] = [
  {
    id: 'cpp',
    name: 'C++ (G++ 13.2)',
    monacoLang: 'cpp',
    badge: 'Competitive / DSA',
    iconText: 'C++',
    compilerName: 'G++ 13.2 (Linux x86_64)',
    defaultCode: `#include <iostream>
#include <vector>
#include <string>

using namespace std;

int main() {
    cout << "Welcome to Sabbir Academy Code Studio!" << endl;
    cout << "Ready for Data Structures & Algorithms (DSA)." << endl;
    
    vector<int> numbers = {10, 20, 30, 40, 50};
    int sum = 0;
    for (int n : numbers) {
        sum += n;
    }
    
    cout << "Calculated Sum: " << sum << endl;
    return 0;
}
`,
  },
  {
    id: 'javascript',
    name: 'JavaScript (Node.js 20)',
    monacoLang: 'javascript',
    badge: 'Ultra-Fast V8 Engine',
    iconText: 'JS',
    compilerName: 'Node.js v20.17 (V8 JIT Engine)',
    defaultCode: `// JavaScript - Sabbir Academy
console.log("Hello from JavaScript in Sabbir Academy!");

const courses = [
  { name: "Full-Stack Development", tier: "Production Grade" },
  { name: "Data Structures & Algorithms", tier: "Interview Ready" },
  { name: "System Design", tier: "High Scale" }
];

console.log("Registered Courses:");
courses.forEach((c, idx) => {
  console.log(\`[\${idx + 1}] \${c.name} -> \${c.tier}\`);
});
`,
  },
  {
    id: 'python',
    name: 'Python (Python 3.10)',
    monacoLang: 'python',
    badge: 'AI / Backend',
    iconText: 'PY',
    compilerName: 'CPython 3.10 (Linux Container)',
    defaultCode: `# Python 3 - Sabbir Academy
def greet(name: str) -> str:
    return f"Hello {name}, welcome to Sabbir Academy!"

def main():
    print(greet("Engineer"))
    
    # List comprehension demo
    squares = [x ** 2 for x in range(1, 6)]
    print("Squares (1 to 5):", squares)

if __name__ == "__main__":
    main()
`,
  },
  {
    id: 'c',
    name: 'C (GCC 13.2)',
    monacoLang: 'c',
    badge: 'System / Fast',
    iconText: 'C',
    compilerName: 'GCC 13.2 (Optimized)',
    defaultCode: `#include <stdio.h>

int main() {
    printf("Hello from C in Sabbir Academy!\\n");
    printf("Master Low-Level Systems and Memory Management.\\n");
    
    int a = 15, b = 25;
    printf("Sum of %d + %d = %d\\n", a, b, a + b);
    return 0;
}
`,
  },
  {
    id: 'rust',
    name: 'Rust (Rust 1.98)',
    monacoLang: 'rust',
    badge: 'Safe & Concurrent',
    iconText: 'RS',
    compilerName: 'Rustc 1.98.1 (Cargo Sandbox)',
    defaultCode: `// Rust - Sabbir Academy
fn main() {
    println!("Hello from Rust at Sabbir Academy!");
    let framework = "Fearless Concurrency & Memory Safety";
    println!("Feature: {}", framework);
    
    let sum: i32 = (1..=10).sum();
    println!("Sum from 1 to 10: {}", sum);
}
`,
  },
  {
    id: 'typescript',
    name: 'TypeScript (TS 5.6)',
    monacoLang: 'typescript',
    badge: 'Type-Safe Web',
    iconText: 'TS',
    compilerName: 'TypeScript 5.6 Compiler',
    defaultCode: `// TypeScript - Sabbir Academy
interface Instructor {
  name: string;
  role: string;
  company: string;
}

const mentor: Instructor = {
  name: "Sabbir Hossen",
  role: "Software Engineer",
  company: "Sofof Tech"
};

console.log(\`Lead Instructor: \${mentor.name} (\${mentor.role} at \${mentor.company})\`);
`,
  },
  {
    id: 'go',
    name: 'Go (Go 1.27)',
    monacoLang: 'go',
    badge: 'Cloud & Microservices',
    iconText: 'GO',
    compilerName: 'Go 1.27.4 Toolchain',
    defaultCode: `package main

import (
    "fmt"
    "time"
)

func main() {
    fmt.Println("Hello from Go at Sabbir Academy!")
    fmt.Printf("Current Execution Time: %s\\n", time.Now().Format(time.RFC1123))
}
`,
  },
];

export default function CodeEditorPage() {
  const [selectedLang, setSelectedLang] = useState<LanguageOption>(LANGUAGES[0]);
  const [code, setCode] = useState<string>(LANGUAGES[0].defaultCode);
  const [stdin, setStdin] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [errorOutput, setErrorOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'output' | 'stdin'>('output');
  const [copied, setCopied] = useState<boolean>(false);
  const [outputCopied, setOutputCopied] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<number>(14);
  const [runningElapsed, setRunningElapsed] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

  // Live stopwatch while running
  useEffect(() => {
    if (isRunning) {
      setRunningElapsed(0);
      const start = Date.now();
      timerRef.current = setInterval(() => {
        setRunningElapsed((Date.now() - start) / 1000);
      }, 50);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning]);

  // Handle language switch: Automatically configures the code and settings!
  const handleLanguageChange = (newLang: LanguageOption) => {
    setSelectedLang(newLang);
    setCode(newLang.defaultCode);
    setOutput('');
    setErrorOutput('');
    setExitCode(null);
    setExecutionTime(null);
  };

  const handleResetCode = () => {
    setCode(selectedLang.defaultCode);
    setOutput('');
    setErrorOutput('');
    setExitCode(null);
    setExecutionTime(null);
  };

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyOutput = async () => {
    const textToCopy = output || errorOutput;
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    setOutputCopied(true);
    setTimeout(() => setOutputCopied(false), 2000);
  };

  const handleClearOutput = () => {
    setOutput('');
    setErrorOutput('');
    setExitCode(null);
    setExecutionTime(null);
  };

  const runCode = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setActiveTab('output');
    setOutput('');
    setErrorOutput('');
    setExitCode(null);
    setExecutionTime(null);

    const startTime = Date.now();

    try {
      // Execute via Next.js Route Handler (instant, zero-config on Vercel) with fallback to backend
      let res = await fetch('/api/compiler/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: selectedLang.id,
          code,
          stdin,
        }),
      });

      if (!res.ok) {
        res = await fetch(`${API_BASE}/compiler/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: selectedLang.id,
            code,
            stdin,
          }),
        });
      }

      if (!res.ok) {
        throw new Error(`Execution service responded with status ${res.status}`);
      }

      const data = await res.json();
      const result = data.data || data;

      setOutput(result.output || (result.success ? '(Program finished with no stdout)' : ''));
      setErrorOutput(result.error || '');
      setExitCode(result.exitCode ?? (result.success ? 0 : 1));
      setExecutionTime(result.executionTimeMs ?? (Date.now() - startTime));
    } catch (err: any) {
      setErrorOutput(
        err?.message || 'Failed to connect to compiler service. Please verify your connection.',
      );
      setExitCode(1);
      setExecutionTime(Date.now() - startTime);
    } finally {
      setIsRunning(false);
    }
  };

  // Keyboard shortcut: Ctrl + Enter or Cmd + Enter to Run Code
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [code, stdin, selectedLang, isRunning]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-neutral-950 text-neutral-100 overflow-hidden font-sans">
      {/* Top Action Bar */}
      <div className="h-14 border-b border-neutral-800 bg-neutral-900/90 backdrop-blur px-4 flex items-center justify-between gap-4 flex-shrink-0 z-10">
        {/* Left: Language Selector & Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-neutral-800/80 border border-neutral-700/80 rounded-xl px-3 py-1.5 shadow-sm">
            <Code2 className="w-4 h-4 text-primary" />
            <select
              value={selectedLang.id}
              onChange={(e) => {
                const found = LANGUAGES.find((l) => l.id === e.target.value);
                if (found) handleLanguageChange(found);
              }}
              className="bg-transparent text-xs sm:text-sm font-semibold text-white focus:outline-none cursor-pointer pr-2"
              aria-label="Select programming language"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-neutral-900 text-white">
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <span className="hidden sm:inline-flex items-center space-x-1 text-[11px] font-medium text-primary px-2.5 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="w-3 h-3 text-primary animate-pulse" />
            <span>{selectedLang.badge}</span>
          </span>
        </div>

        {/* Right: Controls & Run Button */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Font Size Selector */}
          <div className="hidden md:flex items-center space-x-1.5 text-xs text-neutral-400 bg-neutral-800/60 px-2.5 py-1.5 rounded-lg border border-neutral-700/60">
            <span>Font:</span>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="bg-transparent text-white font-mono focus:outline-none cursor-pointer"
            >
              <option value={12} className="bg-neutral-900">12px</option>
              <option value={14} className="bg-neutral-900">14px</option>
              <option value={16} className="bg-neutral-900">16px</option>
              <option value={18} className="bg-neutral-900">18px</option>
            </select>
          </div>

          {/* Reset Code */}
          <button
            onClick={handleResetCode}
            title="Reset code to default template"
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all text-xs flex items-center space-x-1 border border-neutral-700/60"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Copy Code */}
          <button
            onClick={handleCopyCode}
            title="Copy code to clipboard"
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all text-xs flex items-center space-x-1 border border-neutral-700/60"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* RUN CODE BUTTON WITH PULSING GLOW & STOPWATCH */}
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`px-4 py-2 rounded-xl text-white font-semibold text-xs sm:text-sm flex items-center space-x-2 shadow-lg transition-all active:scale-95 disabled:cursor-not-allowed ${
              isRunning
                ? 'bg-neutral-800 border border-primary/50 text-primary shadow-primary/20 animate-pulse'
                : 'bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-400 shadow-orange-500/25 hover:shadow-orange-500/40'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="font-mono">Running ({runningElapsed.toFixed(1)}s)...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Run Code</span>
                <span className="hidden lg:inline text-[10px] bg-black/20 px-1.5 py-0.5 rounded font-mono font-normal">
                  ⌘+↵
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Split Body: Editor on Left, Terminal/Input on Right */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Editor Pane (Left / Top) */}
        <div className="flex-1 h-3/5 lg:h-full relative border-b lg:border-b-0 lg:border-r border-neutral-800 bg-[#1e1e1e]">
          <Editor
            height="100%"
            language={selectedLang.monacoLang}
            value={code}
            onChange={(val) => setCode(val || '')}
            theme="vs-dark"
            options={{
              fontSize,
              fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
              fontLigatures: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 4,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              padding: { top: 12, bottom: 12 },
            }}
          />
        </div>

        {/* Console & Input Pane (Right / Bottom) */}
        <div className="w-full lg:w-[480px] xl:w-[540px] h-2/5 lg:h-full flex flex-col bg-neutral-900 border-neutral-800">
          {/* Console Header Tabs */}
          <div className="h-10 border-b border-neutral-800 bg-neutral-950 px-3 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setActiveTab('output')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'output'
                    ? 'bg-neutral-800 text-white border border-neutral-700/80 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-primary" />
                <span>Output Console</span>
              </button>

              <button
                onClick={() => setActiveTab('stdin')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center space-x-1.5 ${
                  activeTab === 'stdin'
                    ? 'bg-neutral-800 text-white border border-neutral-700/80 shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Custom Input (stdin)</span>
                {stdin.trim() && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            </div>

            {/* Right side actions of Console header */}
            <div className="flex items-center space-x-2 text-[11px] font-mono">
              {(output || errorOutput) && (
                <>
                  <button
                    onClick={handleCopyOutput}
                    title="Copy output"
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    {outputCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                  <button
                    onClick={handleClearOutput}
                    title="Clear console"
                    className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </>
              )}

              {/* Status pills when completed */}
              {executionTime !== null && !isRunning && (
                <div className="flex items-center space-x-1.5">
                  <span className="flex items-center space-x-1 text-neutral-400">
                    <Clock className="w-3 h-3 text-neutral-500" />
                    <span>{executionTime}ms</span>
                  </span>
                  {exitCode === 0 ? (
                    <span className="flex items-center space-x-1 text-green-400 font-semibold bg-green-500/10 px-1.5 py-0.5 rounded border border-green-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>OK</span>
                    </span>
                  ) : (
                    <span className="flex items-center space-x-1 text-red-400 font-semibold bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
                      <XCircle className="w-3 h-3" />
                      <span>Exit {exitCode ?? 1}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tab Contents */}
          <div className="flex-1 p-3 overflow-auto font-mono text-xs leading-relaxed bg-[#0c0d0e] relative select-text">
            {activeTab === 'output' ? (
              <div className="h-full flex flex-col">
                {/* 1. HIGH-TECH PRODUCTION ANIMATED RUNNER LOADER */}
                {isRunning && (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 py-8 animate-in fade-in duration-200">
                    {/* Glowing concentric spinner */}
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                      <div className="absolute inset-1 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                        <Activity className="w-4 h-4 animate-pulse text-primary" />
                      </div>
                    </div>

                    {/* Progress details */}
                    <div className="w-full max-w-xs space-y-2 text-center">
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1">
                        <span className="text-primary font-semibold flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                          <span>Sandboxed Execution</span>
                        </span>
                        <span>{runningElapsed.toFixed(2)}s</span>
                      </div>

                      {/* Animated Shimmer Progress Bar */}
                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden relative">
                        <div className="h-full bg-gradient-to-r from-orange-600 via-amber-400 to-primary w-2/3 rounded-full animate-progress-shimmer" />
                      </div>

                      <p className="text-[11px] text-neutral-400 font-mono tracking-tight pt-1">
                        {runningElapsed < 0.6
                          ? 'Initializing compiler container...'
                          : runningElapsed < 1.4
                          ? `Compiling with ${selectedLang.compilerName}...`
                          : 'Executing binary & capturing stdout streams...'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2. FINISHED OUTPUT DISPLAY */}
                {!isRunning && output && (
                  <div className="space-y-3">
                    {/* Header banner */}
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
                      <div className="flex items-center space-x-1.5 text-green-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Execution Complete (Exit Code 0)</span>
                      </div>
                      <span className="font-mono text-neutral-400">Time: {executionTime}ms</span>
                    </div>

                    {/* Output Text */}
                    <pre className="text-neutral-100 whitespace-pre-wrap break-words leading-relaxed p-2 bg-neutral-950/60 rounded-lg border border-neutral-800/60">
                      {output}
                    </pre>
                  </div>
                )}

                {/* 3. ERROR DISPLAY */}
                {!isRunning && errorOutput && (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-1.5 text-xs font-bold text-red-400 bg-red-950/40 p-2.5 rounded-lg border border-red-800/40">
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span>Compilation / Runtime Error (Exit Code: {exitCode ?? 1})</span>
                    </div>
                    <pre className="p-3 bg-red-950/30 border border-red-900/40 rounded-xl text-red-300 whitespace-pre-wrap break-words leading-relaxed">
                      {errorOutput}
                    </pre>
                  </div>
                )}

                {/* 4. IDLE STATE */}
                {!isRunning && !output && !errorOutput && (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-3 select-none">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 flex items-center justify-center text-primary/70">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs text-neutral-300 font-semibold">
                        Ready to Compile &amp; Run
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        Press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-300">Run Code</kbd> or <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-300">⌘+↵</kbd>
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-[10px] text-neutral-400 pt-2">
                      <span className="px-2 py-0.5 rounded bg-neutral-800/60 border border-neutral-700/40">C++</span>
                      <span className="px-2 py-0.5 rounded bg-neutral-800/60 border border-neutral-700/40">C</span>
                      <span className="px-2 py-0.5 rounded bg-neutral-800/60 border border-neutral-700/40">Python</span>
                      <span className="px-2 py-0.5 rounded bg-neutral-800/60 border border-neutral-700/40">Rust</span>
                      <span className="px-2 py-0.5 rounded bg-neutral-800/60 border border-neutral-700/40">JS</span>
                      <span className="px-2 py-0.5 rounded bg-neutral-800/60 border border-neutral-700/40">TS</span>
                      <span className="px-2 py-0.5 rounded bg-neutral-800/60 border border-neutral-700/40">Go</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <p className="text-[11px] text-neutral-400 mb-2">
                  Provide standard input passed to your program via <code className="text-primary font-mono">cin &gt;&gt;</code>, <code className="text-primary font-mono">scanf()</code>, or <code className="text-primary font-mono">input()</code>:
                </p>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter inputs here (one per line if multiple)..."
                  className="flex-1 w-full bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-200 font-mono focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-none placeholder:text-neutral-600"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
