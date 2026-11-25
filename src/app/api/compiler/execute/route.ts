import { NextRequest, NextResponse } from 'next/server';
import vm from 'node:vm';

interface CompilerConfig {
  compiler: string;
}

const LANGUAGE_COMPILER_MAP: Record<string, CompilerConfig> = {
  c: { compiler: 'gcc-13.2.0-c' },
  cpp: { compiler: 'gcc-13.2.0' },
  python: { compiler: 'cpython-3.10.22' },
  rust: { compiler: 'rust-1.98.1' },
  javascript: { compiler: 'nodejs-20.17.0' },
  typescript: { compiler: 'typescript-5.6.2' },
  go: { compiler: 'go-1.27.4' },
};

// Ultra-fast in-memory execution for JavaScript
function executeJavaScriptLocally(code: string): {
  success: boolean;
  output: string;
  error?: string;
  exitCode: number;
} {
  const logs: string[] = [];
  const errors: string[] = [];

  const safeConsole = {
    log: (...args: any[]) => {
      logs.push(
        args
          .map((a) => (typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)))
          .join(' '),
      );
    },
    info: (...args: any[]) => safeConsole.log(...args),
    warn: (...args: any[]) => {
      logs.push('[WARN] ' + args.map((a) => String(a)).join(' '));
    },
    error: (...args: any[]) => {
      errors.push(args.map((a) => String(a)).join(' '));
    },
    table: (data: any) => {
      try {
        if (Array.isArray(data)) {
          logs.push(JSON.stringify(data, null, 2));
        } else {
          logs.push(JSON.stringify(data, null, 2));
        }
      } catch {
        safeConsole.log(data);
      }
    },
  };

  try {
    const sandbox = {
      console: safeConsole,
      setTimeout: undefined,
      setInterval: undefined,
      process: { version: 'v20.17.0', platform: 'linux', env: {} },
      Math,
      Date,
      JSON,
      Array,
      Object,
      String,
      Number,
      Boolean,
      RegExp,
      Map,
      Set,
      Promise,
      parseInt,
      parseFloat,
    };

    const context = vm.createContext(sandbox);
    const script = new vm.Script(code, { filename: 'solution.js' });
    script.runInContext(context, { timeout: 3000 }); // 3-second limit

    return {
      success: errors.length === 0,
      output: logs.join('\n') + (logs.length > 0 ? '\n' : ''),
      error: errors.join('\n'),
      exitCode: errors.length > 0 ? 1 : 0,
    };
  } catch (err: any) {
    return {
      success: false,
      output: logs.join('\n'),
      error: err?.stack || err?.message || 'Runtime execution error',
      exitCode: 1,
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { language, code, stdin } = body;

    if (!language || !code) {
      return NextResponse.json(
        { success: false, error: 'Language and code are required.' },
        { status: 400 },
      );
    }

    const startTime = Date.now();

    // 1. Instant execution path for JavaScript (Runs in ~1-5ms without network latency)
    if (language === 'javascript' && !stdin) {
      const localRes = executeJavaScriptLocally(code);
      const executionTimeMs = Math.max(1, Date.now() - startTime);

      return NextResponse.json({
        success: localRes.success,
        output: localRes.output,
        error: localRes.error || '',
        compilerMessage: '',
        exitCode: localRes.exitCode,
        executionTimeMs,
      });
    }

    // 2. Sandboxed compiler engine for C, C++, Python, Rust, Go, TypeScript
    const config = LANGUAGE_COMPILER_MAP[language];
    if (!config) {
      return NextResponse.json(
        { success: false, error: `Language "${language}" is not supported.` },
        { status: 400 },
      );
    }

    const payload: Record<string, any> = {
      compiler: config.compiler,
      code,
      stdin: stdin || '',
    };

    const controller = new AbortController();
    const timeoutMs = language === 'rust' ? 25000 : 15000;
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Connection: 'keep-alive',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Compiler service returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const executionTimeMs = Date.now() - startTime;

    const programOutput = data.program_output || '';
    const programError = data.program_error || '';
    const compilerError = data.compiler_error || '';
    const compilerOutput = data.compiler_output || '';
    const status = Number(data.status ?? 0);

    const hasError =
      status !== 0 ||
      Boolean(compilerError) ||
      (Boolean(programError) && !programOutput);
    const combinedOutput = programOutput || compilerOutput;
    const combinedError = compilerError || programError;

    return NextResponse.json({
      success: !hasError,
      output: combinedOutput,
      error: combinedError,
      compilerMessage: compilerOutput,
      exitCode: status,
      executionTimeMs,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        output: '',
        error:
          err.name === 'AbortError'
            ? 'Execution timed out (Time Limit Exceeded - 15s).'
            : `Execution error: ${err?.message || 'Failed to connect to compiler service'}`,
        exitCode: 1,
        executionTimeMs: 0,
      },
      { status: 500 },
    );
  }
}
