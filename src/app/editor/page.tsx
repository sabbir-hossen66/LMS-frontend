'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Code2,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  FileCode,
  FolderPlus,
  FilePlus,
  Trash2,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Globe,
  RefreshCw,
  Smartphone,
  Tablet,
  Monitor,
  X,
  FileText,
  Sliders,
  ExternalLink,
  Zap,
  PanelLeftClose,
  PanelLeftOpen,
  PanelLeft,
} from 'lucide-react';
import { loader } from '@monaco-editor/react';
import { EditorDiscountToast } from '@/components/common/EditorDiscountToast';

// Configure Monaco to load directly from local public/vs assets (zero CDN latency, instant load)
if (typeof window !== 'undefined') {
  loader.config({ paths: { vs: '/vs' } });
}

// Dynamically import Monaco Editor to avoid SSR window issues
const Editor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#1e1e1e] text-neutral-400 space-y-3">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-mono">Loading VS Code Engine...</span>
    </div>
  ),
});

export interface VirtualFile {
  id: string;
  name: string;
  content: string;
  language: string; // monaco language
  isDeletable?: boolean;
}

interface ProjectPreset {
  id: string;
  name: string;
  badge: string;
  category: 'web' | 'compiled';
  defaultCompilerLang?: string;
  files: VirtualFile[];
}

const PROJECT_PRESETS: ProjectPreset[] = [
  {
    id: 'web',
    name: 'Web Dev (HTML / CSS / JS)',
    badge: 'Live Browser Preview',
    category: 'web',
    files: [
      {
        id: 'web-1',
        name: 'index.html',
        language: 'html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sabbir Academy Live Preview</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="card">
    <div class="badge">Sabbir Academy Live Studio</div>
    <h1>Master Full-Stack & Engineering</h1>
    <p>Edit HTML, CSS, and JS to see live changes instantly in the browser preview.</p>
    <button id="actionBtn">Click to Interact</button>
    <div id="counter">Clicks: 0</div>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
      },
      {
        id: 'web-2',
        name: 'style.css',
        language: 'css',
        content: `body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: radial-gradient(circle at top right, #1f1d1d, #0d0e12);
  color: #f3f4f6;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 32px;
  border-radius: 20px;
  max-width: 420px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(12px);
}

.badge {
  display: inline-block;
  background: rgba(249, 115, 22, 0.15);
  color: #f97316;
  border: 1px solid rgba(249, 115, 22, 0.3);
  font-size: 11px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 16px;
}

h1 {
  font-size: 24px;
  margin: 0 0 12px;
  background: linear-gradient(135deg, #ffffff, #f97316);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  font-size: 13px;
  color: #9ca3af;
  line-height: 1.6;
  margin-bottom: 24px;
}

button {
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  border: none;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.3);
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(249, 115, 22, 0.45);
}

#counter {
  margin-top: 16px;
  font-family: monospace;
  font-size: 13px;
  color: #f97316;
}`,
      },
      {
        id: 'web-3',
        name: 'script.js',
        language: 'javascript',
        content: `// Live Script for Sabbir Academy
let count = 0;
const btn = document.getElementById('actionBtn');
const counter = document.getElementById('counter');

btn.addEventListener('click', () => {
  count++;
  counter.textContent = \`Interactive Clicks: \${count}\`;
  btn.style.transform = 'scale(0.95)';
  setTimeout(() => (btn.style.transform = ''), 100);
});
`,
      },
    ],
  },
  {
    id: 'cpp',
    name: 'C++ (G++ 13.2)',
    badge: 'Competitive / DSA',
    category: 'compiled',
    defaultCompilerLang: 'cpp',
    files: [
      {
        id: 'cpp-1',
        name: 'main.cpp',
        language: 'cpp',
        content: `#include <iostream>
#include <vector>
#include <algorithm>

using namespace std;

// Sabbir Academy - Data Structures & Algorithms
int main() {
    cout << "Welcome to Sabbir Academy C++ Studio!" << endl;
    cout << "Ready for competitive programming & interview prep." << endl;

    vector<int> numbers = {64, 34, 25, 12, 22, 11, 90};
    sort(numbers.begin(), numbers.end());

    cout << "Sorted Numbers: ";
    for (int n : numbers) {
        cout << n << " ";
    }
    cout << endl;

    return 0;
}
`,
      },
      {
        id: 'cpp-2',
        name: 'helper.h',
        language: 'cpp',
        content: `// Header utility functions
#ifndef HELPER_H
#define HELPER_H

inline int add(int a, int b) {
    return a + b;
}

#endif
`,
      },
    ],
  },
  {
    id: 'python',
    name: 'Python (Python 3.10)',
    badge: 'AI & Backend',
    category: 'compiled',
    defaultCompilerLang: 'python',
    files: [
      {
        id: 'py-1',
        name: 'main.py',
        language: 'python',
        content: `# Python 3 - Sabbir Academy
def solve():
    print("Welcome to Sabbir Academy Python Environment!")
    courses = ["Full-Stack", "DSA in Python", "System Architecture", "Soft Skills"]
    for i, c in enumerate(courses, 1):
        print(f"[{i}] {c}")

    # Demonstration of list comprehension
    squares = [x**2 for x in range(1, 6)]
    print("Squares 1-5:", squares)

if __name__ == "__main__":
    solve()
`,
      },
    ],
  },
  {
    id: 'c',
    name: 'C (GCC 13.2)',
    badge: 'System / Fast',
    category: 'compiled',
    defaultCompilerLang: 'c',
    files: [
      {
        id: 'c-1',
        name: 'main.c',
        language: 'c',
        content: `#include <stdio.h>

int main() {
    printf("Hello from C in Sabbir Academy!\\n");
    printf("Mastering Low-Level Memory Management & Operating Systems.\\n");

    int a = 20, b = 30;
    printf("Sum: %d + %d = %d\\n", a, b, a + b);
    return 0;
}
`,
      },
    ],
  },
  {
    id: 'rust',
    name: 'Rust (Rust 1.98)',
    badge: 'Safe & Concurrent',
    category: 'compiled',
    defaultCompilerLang: 'rust',
    files: [
      {
        id: 'rs-1',
        name: 'main.rs',
        language: 'rust',
        content: `// Rust - Sabbir Academy
fn main() {
    println!("Hello from Rust at Sabbir Academy!");
    let paradigm = "Memory Safety without Garbage Collection";
    println!("Core Concept: {}", paradigm);

    let sum: i32 = (1..=10).sum();
    println!("Sum 1 to 10: {}", sum);
}
`,
      },
    ],
  },
  {
    id: 'go',
    name: 'Go (Go 1.27)',
    badge: 'Cloud & Microservices',
    category: 'compiled',
    defaultCompilerLang: 'go',
    files: [
      {
        id: 'go-1',
        name: 'main.go',
        language: 'go',
        content: `package main

import (
    "fmt"
    "time"
)

func main() {
    fmt.Println("Hello from Go at Sabbir Academy!")
    fmt.Println("Server initialized at:", time.Now().Format(time.RFC822))
}
`,
      },
    ],
  },
  {
    id: 'javascript',
    name: 'JavaScript (Node.js)',
    badge: 'Ultra-Fast V8 (1ms)',
    category: 'compiled',
    defaultCompilerLang: 'javascript',
    files: [
      {
        id: 'js-1',
        name: 'solution.js',
        language: 'javascript',
        content: `// JavaScript (Node.js) - Sabbir Academy
console.log("Hello from JavaScript in Sabbir Academy!");

const courses = [
  { name: "Full-Stack Development", tier: "Production Grade" },
  { name: "Data Structures & Algorithms", tier: "Interview Ready" },
  { name: "System Design", tier: "High Scale" }
];

console.log("Active Curriculum:");
courses.forEach((c, idx) => {
  console.log(\`[\${idx + 1}] \${c.name} -> \${c.tier}\`);
});
`,
      },
    ],
  },
];

function getLanguageFromFileName(filename: string): string {
  if (filename.endsWith('.html') || filename.endsWith('.htm')) return 'html';
  if (filename.endsWith('.css')) return 'css';
  if (filename.endsWith('.js') || filename.endsWith('.jsx')) return 'javascript';
  if (filename.endsWith('.ts') || filename.endsWith('.tsx')) return 'typescript';
  if (filename.endsWith('.py')) return 'python';
  if (filename.endsWith('.cpp') || filename.endsWith('.cc') || filename.endsWith('.h')) return 'cpp';
  if (filename.endsWith('.c')) return 'c';
  if (filename.endsWith('.rs')) return 'rust';
  if (filename.endsWith('.go')) return 'go';
  if (filename.endsWith('.json')) return 'json';
  return 'plaintext';
}

function getFileIcon(filename: string) {
  if (filename.endsWith('.html')) return <span className="text-orange-500 font-bold text-[10px]">HTML</span>;
  if (filename.endsWith('.css')) return <span className="text-blue-400 font-bold text-[10px]">CSS</span>;
  if (filename.endsWith('.js')) return <span className="text-yellow-400 font-bold text-[10px]">JS</span>;
  if (filename.endsWith('.ts')) return <span className="text-blue-500 font-bold text-[10px]">TS</span>;
  if (filename.endsWith('.py')) return <span className="text-emerald-400 font-bold text-[10px]">PY</span>;
  if (filename.endsWith('.cpp') || filename.endsWith('.h')) return <span className="text-blue-300 font-bold text-[10px]">C++</span>;
  if (filename.endsWith('.c')) return <span className="text-cyan-400 font-bold text-[10px]">C</span>;
  if (filename.endsWith('.rs')) return <span className="text-amber-500 font-bold text-[10px]">RS</span>;
  if (filename.endsWith('.go')) return <span className="text-cyan-300 font-bold text-[10px]">GO</span>;
  return <FileText className="w-3.5 h-3.5 text-neutral-400" />;
}

export default function CodeEditorPage() {
  const [selectedPreset, setSelectedPreset] = useState<ProjectPreset>(PROJECT_PRESETS[0]);
  const [files, setFiles] = useState<VirtualFile[]>(PROJECT_PRESETS[0].files);
  const [activeFileId, setActiveFileId] = useState<string>(PROJECT_PRESETS[0].files[0].id);

  // File explorer controls
  const [isExplorerOpen, setIsExplorerOpen] = useState(true);
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  // Right pane tab: 'output' | 'preview' | 'stdin'
  const [activeTab, setActiveTab] = useState<'preview' | 'output' | 'stdin'>('preview');
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [previewKey, setPreviewKey] = useState(0);

  // Compiler state
  const [stdin, setStdin] = useState('');
  const [output, setOutput] = useState('');
  const [errorOutput, setErrorOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState<number | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const [fontSize, setFontSize] = useState(14);
  const [copied, setCopied] = useState(false);
  const [outputCopied, setOutputCopied] = useState(false);
  const [runningElapsed, setRunningElapsed] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  const activeFile = useMemo(() => {
    return files.find((f) => f.id === activeFileId) || files[0];
  }, [files, activeFileId]);

  // Handle Preset Change
  const handlePresetChange = (preset: ProjectPreset) => {
    setSelectedPreset(preset);
    setFiles(preset.files);
    setActiveFileId(preset.files[0].id);
    setOutput('');
    setErrorOutput('');
    setExitCode(null);
    setExecutionTime(null);
    if (preset.category === 'web') {
      setActiveTab('preview');
    } else {
      setActiveTab('output');
    }
  };

  // Stopwatch timer while compiling
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

  // Auto focus input when creating file
  useEffect(() => {
    if (isCreatingFile) {
      setTimeout(() => newFileInputRef.current?.focus(), 100);
    }
  }, [isCreatingFile]);

  const updateCurrentFileContent = (newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === activeFileId ? { ...f, content: newContent } : f)),
    );
  };

  const handleCreateFile = () => {
    const trimmed = newFileName.trim();
    if (!trimmed) {
      setIsCreatingFile(false);
      return;
    }

    if (files.some((f) => f.name.toLowerCase() === trimmed.toLowerCase())) {
      alert('A file with this name already exists.');
      return;
    }

    const newLang = getLanguageFromFileName(trimmed);
    const newFile: VirtualFile = {
      id: 'file-' + Date.now(),
      name: trimmed,
      language: newLang,
      content: '',
      isDeletable: true,
    };

    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
    setNewFileName('');
    setIsCreatingFile(false);
  };

  const handleDeleteFile = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (files.length <= 1) {
      alert('You must have at least one file in the project.');
      return;
    }
    const remaining = files.filter((f) => f.id !== id);
    setFiles(remaining);
    if (activeFileId === id) {
      setActiveFileId(remaining[0].id);
    }
  };

  const handleResetProject = () => {
    setFiles(selectedPreset.files);
    setActiveFileId(selectedPreset.files[0].id);
    setOutput('');
    setErrorOutput('');
    setExitCode(null);
    setExecutionTime(null);
  };

  const handleCopyCode = async () => {
    if (!activeFile) return;
    await navigator.clipboard.writeText(activeFile.content);
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

  // Compile / Run Code Function
  const runCode = async () => {
    if (isRunning) return;

    // If it's a web project with HTML/CSS, switch to browser preview and trigger live reload
    if (selectedPreset.category === 'web' || activeFile.name.endsWith('.html')) {
      setActiveTab('preview');
      setPreviewKey((prev) => prev + 1);
      return;
    }

    setIsRunning(true);
    setActiveTab('output');
    setOutput('');
    setErrorOutput('');
    setExitCode(null);
    setExecutionTime(null);

    const startTime = Date.now();
    const langToExecute = selectedPreset.defaultCompilerLang || activeFile.language;

    try {
      let res = await fetch('/api/compiler/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: langToExecute,
          code: activeFile.content,
          stdin,
        }),
      });

      const result = await res.json().catch(() => null);

      if (!res.ok && !result) {
        throw new Error(`Compiler service returned status ${res.status}`);
      }

      if (result) {
        setOutput(result.output || (result.success ? '(Finished with no stdout output)' : ''));
        setErrorOutput(result.error || '');
        setExitCode(result.exitCode ?? (result.success ? 0 : 1));
        setExecutionTime(result.executionTimeMs ?? (Date.now() - startTime));
      }
    } catch (err: any) {
      setErrorOutput(err?.message || 'Failed to connect to compiler service.');
      setExitCode(1);
      setExecutionTime(Date.now() - startTime);
    } finally {
      setIsRunning(false);
    }
  };

  // Build Bundled HTML for the Live Browser Preview
  const bundledHtml = useMemo(() => {
    const htmlFile = files.find((f) => f.name.endsWith('.html'))?.content || '<h1>No HTML File</h1>';
    const cssFile = files.find((f) => f.name.endsWith('.css'))?.content || '';
    const jsFile = files.find((f) => f.name.endsWith('.js') && !f.name.endsWith('.json'))?.content || '';

    // Clean body and strip external script/link tags so the browser preview doesn't trigger 404 network requests
    let bodyContent = htmlFile.replace(/<!DOCTYPE html>|<html[\s\S]*?<body[^>]*>|<\/body>[\s\S]*?<\/html>/gi, '');
    bodyContent = bodyContent.replace(/<script\b[^>]*src=["'][^"']*["'][^>]*>[\s\S]*?<\/script>/gi, '');
    bodyContent = bodyContent.replace(/<link\b[^>]*rel=["']stylesheet["'][^>]*\/?>/gi, '');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <style>${cssFile}</style>
        </head>
        <body>
          ${bodyContent}
          <script>
            try {
              ${jsFile}
            } catch (err) {
              console.error(err);
            }
          </script>
        </body>
      </html>
    `;
  }, [files]);

  // Keyboard shortcuts: Ctrl/Cmd+Enter to Run, Ctrl/Cmd+B to Toggle Sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsExplorerOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile, files, selectedPreset, stdin, isRunning]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#181818] text-neutral-100 overflow-hidden font-sans select-none relative">
      {/* 15s Periodic Minimal Course Discount Toast */}
      <EditorDiscountToast />

      {/* Top VS Code Control Bar */}
      <div className="h-12 border-b border-[#2b2b2b] bg-[#1f1f1f] px-3 flex items-center justify-between gap-3 flex-shrink-0 z-10">
        {/* Left: Sidebar Toggle & Project Template Selector */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExplorerOpen((prev) => !prev)}
            title={isExplorerOpen ? 'Hide Explorer Sidebar (Ctrl+B)' : 'Show Explorer Sidebar (Ctrl+B)'}
            className={`p-1.5 rounded-lg border transition-all text-xs flex items-center space-x-1.5 ${
              isExplorerOpen
                ? 'bg-neutral-800 text-primary border-primary/40'
                : 'text-neutral-400 hover:text-white border-[#3c3c3c] bg-[#252526]'
            }`}
          >
            {isExplorerOpen ? <PanelLeftClose className="w-4 h-4 text-primary" /> : <PanelLeftOpen className="w-4 h-4" />}
            <span className="hidden sm:inline font-mono text-[11px] font-semibold">
              {isExplorerOpen ? 'Explorer' : 'Explorer'}
            </span>
          </button>

          <div className="h-4 w-[1px] bg-neutral-700 mx-1 hidden sm:block" />

          {/* Project Preset Selector */}
          <div className="flex items-center space-x-1.5 bg-[#252526] border border-[#3c3c3c] rounded-lg px-2.5 py-1 text-xs">
            <span className="text-neutral-400 font-mono text-[11px] hidden md:inline">Preset:</span>
            <select
              value={selectedPreset.id}
              onChange={(e) => {
                const found = PROJECT_PRESETS.find((p) => p.id === e.target.value);
                if (found) handlePresetChange(found);
              }}
              className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
              aria-label="Select Project Template"
            >
              {PROJECT_PRESETS.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <span className="hidden xl:inline-flex items-center space-x-1 text-[10px] font-medium text-primary px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20">
            <Zap className="w-2.5 h-2.5" />
            <span>{selectedPreset.badge}</span>
          </span>
        </div>

        {/* Right Actions: Font Size, Reset, Copy, and Run Code */}
        <div className="flex items-center space-x-2">
          {/* Font Size Selector */}
          <div className="hidden lg:flex items-center space-x-1 text-[11px] text-neutral-400 bg-[#252526] px-2 py-1 rounded border border-[#3c3c3c]">
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

          {/* Reset Project */}
          <button
            onClick={handleResetProject}
            title="Reset files to original preset"
            className="p-1.5 rounded-lg bg-[#252526] hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all text-xs flex items-center space-x-1 border border-[#3c3c3c]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          {/* Copy Active File */}
          <button
            onClick={handleCopyCode}
            title="Copy current file code"
            className="p-1.5 rounded-lg bg-[#252526] hover:bg-neutral-700 text-neutral-300 hover:text-white transition-all text-xs flex items-center space-x-1 border border-[#3c3c3c]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          {/* RUN CODE BUTTON */}
          <button
            onClick={runCode}
            disabled={isRunning}
            className={`px-3.5 py-1.5 rounded-xl text-white font-semibold text-xs flex items-center space-x-1.5 shadow-md transition-all active:scale-95 disabled:cursor-not-allowed ${
              isRunning
                ? 'bg-neutral-800 border border-primary/50 text-primary shadow-primary/20 animate-pulse'
                : 'bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-400 shadow-orange-500/25 hover:shadow-orange-500/40'
            }`}
          >
            {isRunning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="font-mono">Running ({runningElapsed.toFixed(1)}s)...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>{selectedPreset.category === 'web' ? 'Run / Preview' : 'Run Code'}</span>
                <span className="hidden md:inline text-[9px] bg-black/20 px-1 py-0.2 rounded font-mono">
                  ⌘+↵
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* VS Code Left Activity Bar */}
        <div className="w-11 bg-[#1e1e1e] border-r border-[#2b2b2b] flex flex-col items-center py-2 space-y-2 flex-shrink-0 select-none z-10">
          <button
            onClick={() => setIsExplorerOpen((prev) => !prev)}
            title={isExplorerOpen ? 'Hide File Explorer (Ctrl+B)' : 'Show File Explorer (Ctrl+B)'}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all relative group ${
              isExplorerOpen
                ? 'text-white bg-neutral-800'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/60'
            }`}
          >
            {isExplorerOpen && (
              <div className="absolute -left-1.5 top-1.5 bottom-1.5 w-1 bg-primary rounded-r" />
            )}
            <FolderOpen className={`w-4 h-4 ${isExplorerOpen ? 'text-primary' : 'text-neutral-400 group-hover:text-white'}`} />
          </button>
        </div>

        {/* 1. VS CODE FILE EXPLORER SIDEBAR */}
        {isExplorerOpen && (
          <div className="w-52 sm:w-60 bg-[#181818] border-r border-[#2b2b2b] flex flex-col flex-shrink-0 animate-in fade-in duration-150">
            {/* Explorer Title Bar */}
            <div className="h-9 px-3 border-b border-[#2b2b2b] flex items-center justify-between text-neutral-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
              <span className="flex items-center space-x-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-primary" />
                <span>Explorer</span>
              </span>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setIsCreatingFile(true)}
                  title="New File"
                  className="p-1 rounded hover:bg-neutral-800 hover:text-white transition-colors"
                >
                  <FilePlus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsExplorerOpen(false)}
                  title="Collapse Sidebar (Ctrl+B)"
                  className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
                >
                  <PanelLeftClose className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto py-1">
              <div className="px-3 py-1 text-[10px] text-neutral-500 font-mono uppercase tracking-wider">
                {selectedPreset.name.split(' ')[0]} Project
              </div>

              {files.map((file) => {
                const isActive = file.id === activeFileId;
                return (
                  <div
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`group px-3 py-1.5 flex items-center justify-between text-xs cursor-pointer font-mono transition-colors ${
                      isActive
                        ? 'bg-[#37373d] text-white border-l-2 border-primary font-semibold'
                        : 'text-neutral-400 hover:bg-[#2a2d2e] hover:text-neutral-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {getFileIcon(file.name)}
                      <span className="truncate">{file.name}</span>
                    </div>

                    {file.isDeletable && (
                      <button
                        onClick={(e) => handleDeleteFile(e, file.id)}
                        title="Delete file"
                        className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 transition-opacity"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Inline Input for New File Creation */}
              {isCreatingFile && (
                <div className="px-3 py-1.5 flex items-center space-x-1.5 bg-[#252526]">
                  <FilePlus className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <input
                    ref={newFileInputRef}
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateFile();
                      if (e.key === 'Escape') setIsCreatingFile(false);
                    }}
                    onBlur={handleCreateFile}
                    placeholder="e.g. style.css"
                    className="w-full bg-neutral-900 border border-primary/50 text-white text-xs font-mono px-1.5 py-0.5 rounded focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. CENTER: MONACO CODE EDITOR WITH TABS */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-[#2b2b2b] bg-[#1e1e1e]">
          {/* Top File Tabs */}
          <div className="h-9 bg-[#252526] border-b border-[#1e1e1e] flex items-center overflow-x-auto scrollbar-none">
            {!isExplorerOpen && (
              <button
                onClick={() => setIsExplorerOpen(true)}
                title="Open File Explorer (Ctrl+B)"
                className="h-full px-2.5 flex items-center justify-center text-neutral-400 hover:text-primary hover:bg-[#1e1e1e] border-r border-[#1e1e1e] transition-colors flex-shrink-0 group"
              >
                <PanelLeftOpen className="w-3.5 h-3.5 text-primary group-hover:scale-110 transition-transform" />
              </button>
            )}
            {files.map((file) => {
              const isActive = file.id === activeFileId;
              return (
                <div
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 text-xs font-mono cursor-pointer border-r border-[#1e1e1e] transition-colors ${
                    isActive
                      ? 'bg-[#1e1e1e] text-white border-t-2 border-t-primary font-semibold'
                      : 'text-neutral-400 bg-[#2d2d2d] hover:bg-[#1e1e1e]/60 hover:text-neutral-200'
                  }`}
                >
                  {getFileIcon(file.name)}
                  <span>{file.name}</span>
                  {file.isDeletable && (
                    <button
                      onClick={(e) => handleDeleteFile(e, file.id)}
                      className="hover:text-red-400 p-0.5 rounded"
                      title="Close file"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Monaco Editor Container */}
          <div className="flex-1 relative">
            <Editor
              height="100%"
              language={activeFile.language}
              value={activeFile.content}
              onChange={(val) => updateCurrentFileContent(val || '')}
              theme="vs-dark"
              options={{
                fontSize,
                fontFamily: "'Fira Code', 'JetBrains Mono', Menlo, Monaco, Consolas, monospace",
                fontLigatures: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                wordWrap: 'on',
                lineNumbers: 'on',
                renderWhitespace: 'selection',
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                smoothScrolling: true,
                padding: { top: 10, bottom: 10 },
              }}
            />
          </div>
        </div>

        {/* 3. RIGHT PANE: LIVE BROWSER PREVIEW & TERMINAL CONSOLE */}
        <div className="w-full lg:w-[480px] xl:w-[540px] flex flex-col bg-[#141414] flex-shrink-0">
          {/* Tab Navigation: Preview vs Output vs stdin */}
          <div className="h-9 border-b border-[#2b2b2b] bg-[#1a1a1a] px-2 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              {/* Live Web Preview Tab */}
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'preview'
                    ? 'bg-[#252526] text-white border border-[#3c3c3c] shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-primary" />
                <span>Live Browser</span>
              </button>

              {/* Output Console Tab */}
              <button
                onClick={() => setActiveTab('output')}
                className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'output'
                    ? 'bg-[#252526] text-white border border-[#3c3c3c] shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Terminal className="w-3.5 h-3.5 text-primary" />
                <span>Console</span>
              </button>

              {/* Stdin Tab */}
              <button
                onClick={() => setActiveTab('stdin')}
                className={`px-2.5 py-1 text-xs font-semibold rounded flex items-center space-x-1.5 transition-colors ${
                  activeTab === 'stdin'
                    ? 'bg-[#252526] text-white border border-[#3c3c3c] shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <span>Input (stdin)</span>
                {stdin.trim() && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
              </button>
            </div>

            {/* Tab Actions */}
            <div className="flex items-center space-x-1.5 text-xs">
              {activeTab === 'preview' ? (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    title="Desktop View"
                    className={`p-1 rounded ${previewDevice === 'desktop' ? 'text-primary bg-neutral-800' : 'text-neutral-500'}`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('tablet')}
                    title="Tablet View (768px)"
                    className={`p-1 rounded ${previewDevice === 'tablet' ? 'text-primary bg-neutral-800' : 'text-neutral-500'}`}
                  >
                    <Tablet className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    title="Mobile View (375px)"
                    className={`p-1 rounded ${previewDevice === 'mobile' ? 'text-primary bg-neutral-800' : 'text-neutral-500'}`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPreviewKey((prev) => prev + 1)}
                    title="Refresh Preview"
                    className="p-1 rounded text-neutral-400 hover:text-white transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                (output || errorOutput) && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleCopyOutput}
                      title="Copy console output"
                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                      {outputCopied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                    <button
                      onClick={() => {
                        setOutput('');
                        setErrorOutput('');
                      }}
                      title="Clear console"
                      className="p-1 rounded text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          {/* Right Pane Body */}
          <div className="flex-1 bg-[#0c0d0e] overflow-hidden flex flex-col">
            {/* TAB 1: LIVE SIMULATED BROWSER PREVIEW */}
            {activeTab === 'preview' && (
              <div className="h-full flex flex-col bg-[#111] overflow-hidden">
                {/* Browser Top URL Bar */}
                <div className="h-8 bg-[#1e1e1e] border-b border-[#2b2b2b] px-3 flex items-center space-x-2 flex-shrink-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 bg-[#121212] rounded-md px-2.5 py-0.5 text-[10px] font-mono text-neutral-400 flex items-center space-x-1.5 border border-[#2b2b2b]">
                    <span className="text-green-400">🔒</span>
                    <span className="text-neutral-300">https://preview.sabbir-academy.local/</span>
                  </div>
                </div>

                {/* Simulated Device Frame */}
                <div className="flex-1 overflow-auto flex items-center justify-center p-2 bg-[#09090b]">
                  <div
                    className={`h-full transition-all duration-300 bg-white rounded-lg overflow-hidden shadow-2xl border border-neutral-800 ${
                      previewDevice === 'mobile'
                        ? 'w-[375px]'
                        : previewDevice === 'tablet'
                        ? 'w-[768px]'
                        : 'w-full'
                    }`}
                  >
                    <iframe
                      key={previewKey}
                      srcDoc={bundledHtml}
                      title="Sabbir Academy Live Preview"
                      sandbox="allow-scripts allow-modals"
                      className="w-full h-full border-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: OUTPUT CONSOLE */}
            {activeTab === 'output' && (
              <div className="h-full p-3 overflow-auto font-mono text-xs leading-relaxed select-text">
                {isRunning && (
                  <div className="h-full flex flex-col items-center justify-center space-y-4 py-8 animate-in fade-in duration-200">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
                      <div className="absolute inset-1 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                        <Activity className="w-4 h-4 animate-pulse text-primary" />
                      </div>
                    </div>

                    <div className="w-full max-w-xs space-y-2 text-center">
                      <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 px-1">
                        <span className="text-primary font-semibold flex items-center space-x-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
                          <span>Sandboxed Execution</span>
                        </span>
                        <span>{runningElapsed.toFixed(2)}s</span>
                      </div>

                      <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden relative">
                        <div className="h-full bg-gradient-to-r from-orange-600 via-amber-400 to-primary w-2/3 rounded-full animate-progress-shimmer" />
                      </div>

                      <p className="text-[11px] text-neutral-400 font-mono tracking-tight pt-1">
                        {runningElapsed < 0.6
                          ? 'Optimizing execution environment...'
                          : runningElapsed < 1.4
                          ? `Compiling ${activeFile.name}...`
                          : 'Executing binary and capturing streams...'}
                      </p>
                    </div>
                  </div>
                )}

                {!isRunning && output && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-neutral-400 bg-neutral-900/80 p-2 rounded-lg border border-neutral-800">
                      <div className="flex items-center space-x-1.5 text-green-400 font-semibold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Execution Complete (Exit Code 0)</span>
                      </div>
                      <span className="font-mono text-neutral-400">Time: {executionTime}ms</span>
                    </div>

                    <pre className="text-neutral-100 whitespace-pre-wrap break-words leading-relaxed p-2 bg-neutral-950/60 rounded-lg border border-neutral-800/60">
                      {output}
                    </pre>
                  </div>
                )}

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

                {!isRunning && !output && !errorOutput && (
                  <div className="h-full flex flex-col items-center justify-center text-neutral-500 space-y-3 select-none">
                    <div className="w-12 h-12 rounded-2xl bg-neutral-800/50 border border-neutral-700/50 flex items-center justify-center text-primary/70">
                      <Terminal className="w-6 h-6" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-xs text-neutral-300 font-semibold">Ready to Run</p>
                      <p className="text-[11px] text-neutral-500">
                        Click <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-300">Run Code</kbd> or press <kbd className="px-1.5 py-0.5 bg-neutral-800 rounded border border-neutral-700 text-neutral-300">⌘+↵</kbd>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CUSTOM STDIN */}
            {activeTab === 'stdin' && (
              <div className="h-full p-3 flex flex-col">
                <p className="text-[11px] text-neutral-400 mb-2">
                  Provide custom standard input for programs taking <code className="text-primary font-mono">cin &gt;&gt;</code>, <code className="text-primary font-mono">scanf()</code>, or <code className="text-primary font-mono">input()</code>:
                </p>
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter input values here..."
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
