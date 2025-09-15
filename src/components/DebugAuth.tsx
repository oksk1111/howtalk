import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const DebugAuth = () => {
  const [status, setStatus] = useState('테스트 시작...');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const testConnection = async () => {
      try {
        addLog('연결 테스트 시작');
        setStatus('Supabase 연결 테스트 중...');
        
        // 타임아웃 설정
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('연결 타임아웃 (10초)')), 10000)
        );
        
        // 더 간단한 테스트 - auth 상태만 확인
        const authTestPromise = supabase.auth.getSession();
        
        addLog('세션 확인 중...');
        const result = await Promise.race([authTestPromise, timeoutPromise]);
        
        addLog('세션 확인 완료');
        setStatus('Supabase 인증 연결 성공!');
        
        // 추가로 간단한 쿼리 테스트
        addLog('데이터베이스 연결 테스트 중...');
        const { error } = await supabase.from('profiles').select('id').limit(1);
        
        if (error) {
          addLog(`DB 쿼리 오류: ${error.message}`);
          setStatus(`DB 오류: ${error.message}`);
        } else {
          addLog('데이터베이스 연결 성공');
          setStatus('모든 연결 테스트 성공!');
        }
        
      } catch (error: any) {
        addLog(`연결 실패: ${error.message}`);
        setStatus(`연결 실패: ${error.message}`);
        
        // 네트워크 오류인 경우 추가 정보 제공
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          addLog('네트워크 연결 문제 감지');
          setStatus('네트워크 연결 문제: 인터넷 연결 또는 방화벽을 확인해주세요');
        }
      }
    };

    testConnection();
  }, []);

  const skipAuth = () => {
    // 인증을 건너뛰고 직접 앱으로 이동
    window.location.href = '/auth';
  };

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px', maxWidth: '600px' }}>
      <h3>디버그 정보</h3>
      <p><strong>상태:</strong> {status}</p>
      <p><strong>현재 URL:</strong> {window.location.href}</p>
      <p><strong>Supabase URL:</strong> {supabase.supabaseUrl}</p>
      
      <button 
        onClick={skipAuth}
        style={{ 
          margin: '10px 0', 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        로그인 페이지로 이동
      </button>
      
      <div style={{ marginTop: '20px' }}>
        <h4>연결 로그:</h4>
        <div style={{ 
          backgroundColor: '#000', 
          color: '#0f0', 
          padding: '10px', 
          borderRadius: '5px', 
          fontSize: '12px',
          fontFamily: 'monospace',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;
