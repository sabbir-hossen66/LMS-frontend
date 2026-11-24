import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Sabbir Academy - Master Coding, CS Theory & Soft Skills';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0f0e0c',
          backgroundImage:
            'radial-gradient(circle at 25px 25px, #26211a 2%, transparent 0%), radial-gradient(circle at 75px 75px, #26211a 2%, transparent 0%)',
          backgroundSize: '100px 100px',
          padding: '60px 80px',
          fontFamily: 'sans-serif',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Glow circle */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(234, 88, 12, 0.25) 0%, transparent 70%)',
            top: '-100px',
            right: '-100px',
          }}
        />

        {/* Top Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(234, 88, 12, 0.15)',
            border: '1.5px solid rgba(234, 88, 12, 0.4)',
            padding: '10px 24px',
            borderRadius: '9999px',
            marginBottom: '30px',
            fontSize: '18px',
            fontWeight: 700,
            color: '#f97316',
            letterSpacing: '1px',
          }}
        >
          🚀 SABBIR ACADEMY • BY SABBIR HOSSEN
        </div>

        {/* Main Title */}
        <div
          style={{
            fontSize: '56px',
            fontWeight: 900,
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: '24px',
            letterSpacing: '-1.5px',
            maxWidth: '1000px',
          }}
        >
          Master Full-Stack Coding,{' '}
          <span
            style={{
              background: 'linear-gradient(to right, #ea580c, #f97316, #fbbf24)',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            CS Theory & Soft Skills
          </span>
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: '24px',
            color: '#a3a3a3',
            textAlign: 'center',
            maxWidth: '850px',
            lineHeight: 1.5,
            marginBottom: '40px',
          }}
        >
          Production-grade engineering curriculum covering algorithms, full-stack architecture, and career-accelerating soft skills.
        </div>

        {/* Feature Pills */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: '#1c1917',
              border: '1px solid #292524',
              padding: '10px 20px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#d6d3d1',
            }}
          >
            💻 Real-World Coding
          </div>
          <div
            style={{
              background: '#1c1917',
              border: '1px solid #292524',
              padding: '10px 20px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#d6d3d1',
            }}
          >
            📐 CS Fundamentals
          </div>
          <div
            style={{
              background: '#1c1917',
              border: '1px solid #292524',
              padding: '10px 20px',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 600,
              color: '#d6d3d1',
            }}
          >
            🗣️ Career Soft Skills
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
