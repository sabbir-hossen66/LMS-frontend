import { NextRequest, NextResponse } from 'next/server';

interface CompilerConfig {
  compiler: string;
  options?: string;
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

    const config = LANGUAGE_COMPILER_MAP[language];
    if (!config) {
      return NextResponse.json(
        { success: false, error: `Language "${language}" is not supported.` },
        { status: 400 },
      );
    }

    const startTime = Date.now();
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
      headers: { 'Content-Type': 'application/json' },
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
