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

// Global Execution Cache (stores recent compilation results for 0ms execution)
const executionCache = new Map<
  string,
  {
    success: boolean;
    output: string;
    error?: string;
    compilerMessage?: string;
    exitCode: number;
    timestamp: number;
  }
>();

// Clean old cache entries periodically
function pruneCache() {
  const now = Date.now();
  if (executionCache.size > 200) {
    executionCache.forEach((val, key) => {
      if (now - val.timestamp > 3600000) {
        // 1 hour
        executionCache.delete(key);
      }
    });
  }
}

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
        logs.push(JSON.stringify(data, null, 2));
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

const CODAPI_SANDBOX_MAP: Record<string, { sandbox: string; filename: string }> = {
  c: { sandbox: 'gcc', filename: 'main.c' },
  cpp: { sandbox: 'cpp', filename: 'main.cpp' },
  python: { sandbox: 'python', filename: 'main.py' },
  rust: { sandbox: 'rust', filename: 'main.rs' },
  go: { sandbox: 'go', filename: 'main.go' },
};

// Execute using high-speed Codapi sandbox (<1s execution)
async function executeViaCodapi(
  language: string,
  code: string,
): Promise<{ success: boolean; output: string; error?: string; exitCode: number; executionTimeMs: number } | null> {
  const map = CODAPI_SANDBOX_MAP[language];
  if (!map) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://api.codapi.org/v1/exec', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sandbox: map.sandbox,
        command: 'run',
        files: {
          [map.filename]: code,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return null;

    const data = await response.json();
    if (typeof data.ok !== 'boolean') return null;

    const output = data.stdout || '';
    const error = data.stderr || '';

    return {
      success: data.ok && !error,
      output: output + (output && !output.endsWith('\n') ? '\n' : ''),
      error: error || undefined,
      exitCode: data.ok ? 0 : 1,
      executionTimeMs: data.duration || 500,
    };
  } catch {
    return null; // Fallback to Wandbox
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
    const cacheKey = `${language}:::${code.trim()}:::${(stdin || '').trim()}`;

    // 1. Cache hit optimization (Returns in 0-1ms!)
    const cached = executionCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({
        success: cached.success,
        output: cached.output,
        error: cached.error || '',
        compilerMessage: cached.compilerMessage || '',
        exitCode: cached.exitCode,
        executionTimeMs: 1, // Cached instant run
        isCached: true,
      });
    }

    // 2. Instant local execution path for JavaScript (Runs in ~1ms without network)
    if (language === 'javascript' && !stdin) {
      const localRes = executeJavaScriptLocally(code);
      const executionTimeMs = Math.max(1, Date.now() - startTime);

      executionCache.set(cacheKey, {
        success: localRes.success,
        output: localRes.output,
        error: localRes.error,
        exitCode: localRes.exitCode,
        timestamp: Date.now(),
      });
      pruneCache();

      return NextResponse.json({
        success: localRes.success,
        output: localRes.output,
        error: localRes.error || '',
        compilerMessage: '',
        exitCode: localRes.exitCode,
        executionTimeMs,
      });
    }

    // 3. Ultra-fast Cloud Sandbox path (<1s for C, C++, Python, Rust, Go)
    if (!stdin && CODAPI_SANDBOX_MAP[language]) {
      const codapiResult = await executeViaCodapi(language, code);
      if (codapiResult) {
        executionCache.set(cacheKey, {
          success: codapiResult.success,
          output: codapiResult.output,
          error: codapiResult.error,
          compilerMessage: '',
          exitCode: codapiResult.exitCode,
          timestamp: Date.now(),
        });
        pruneCache();

        return NextResponse.json({
          success: codapiResult.success,
          output: codapiResult.output,
          error: codapiResult.error || '',
          compilerMessage: '',
          exitCode: codapiResult.exitCode,
          executionTimeMs: codapiResult.executionTimeMs,
        });
      }
    }

    // 4. Robust Sandboxed compiler engine fallback (Wandbox)
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
    const timeoutMs = 35000; // Generous 35s timeout
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

    // Cache successful or evaluated runs
    executionCache.set(cacheKey, {
      success: !hasError,
      output: combinedOutput,
      error: combinedError,
      compilerMessage: compilerOutput,
      exitCode: status,
      timestamp: Date.now(),
    });
    pruneCache();

    return NextResponse.json({
      success: !hasError,
      output: combinedOutput,
      error: combinedError,
      compilerMessage: compilerOutput,
      exitCode: status,
      executionTimeMs,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      output: '',
      error:
        err.name === 'AbortError'
          ? 'Execution timed out (Time Limit Exceeded - 35s).'
          : `Execution error: ${err?.message || 'Failed to connect to compiler service'}`,
      exitCode: 1,
      executionTimeMs: 0,
    });
  }
}
