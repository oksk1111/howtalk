import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 개발 환경에서 디버깅 도구 로드
if (import.meta.env.DEV) {
  import('./utils/consoleDebugger.ts').then(() => {
    console.log('🔧 콘솔 디버거가 로드되었습니다.');
  }).catch(console.error);
}

createRoot(document.getElementById("root")!).render(<App />);
