import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const ConnectionTest = () => {
  const [testResults, setTestResults] = useState<{
    supabaseUrl: 'pending' | 'success' | 'error';
    supabaseAuth: 'pending' | 'success' | 'error';
    basicFetch: 'pending' | 'success' | 'error';
  }>({
    supabaseUrl: 'pending',
    supabaseAuth: 'pending',
    basicFetch: 'pending'
  });
  
  const [logs, setLogs] = useState<string[]>([]);
  const [testing, setTesting] = useState(false);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testConnection = async () => {
    setTesting(true);
    setLogs([]);
    
    // 1. 기본 네트워크 연결 테스트
    addLog('기본 네트워크 연결 테스트 시작...');
    try {
      const response = await fetch('https://httpbin.org/get', { 
        method: 'GET',
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        setTestResults(prev => ({ ...prev, basicFetch: 'success' }));
        addLog('✅ 기본 네트워크 연결 성공');
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, basicFetch: 'error' }));
      addLog(`❌ 기본 네트워크 연결 실패: ${error.message}`);
    }

    // 2. Supabase URL 접근 테스트
    addLog('Supabase URL 접근 테스트 시작...');
    try {
      const response = await fetch('https://jdkornpmgusbxsnxcmub.supabase.co/rest/v1/', {
        method: 'HEAD',
        signal: AbortSignal.timeout(10000),
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impka29ybnBtZ3VzYnhzbnhjbXViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTM1NDMsImV4cCI6MjA3Mjg4OTU0M30.r1gQyW-5PAc2RN617oiKhzMTdDCx1LztP-9mh3Xbqvw'
        }
      });
      
      setTestResults(prev => ({ ...prev, supabaseUrl: 'success' }));
      addLog(`✅ Supabase URL 접근 성공 (${response.status})`);
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, supabaseUrl: 'error' }));
      addLog(`❌ Supabase URL 접근 실패: ${error.message}`);
    }

    // 3. Supabase 인증 테스트 (동적 임포트)
    addLog('Supabase 클라이언트 테스트 시작...');
    try {
      // 동적으로 supabase 클라이언트 임포트
      const { supabase } = await import('@/integrations/supabase/client');
      
      // 간단한 세션 확인
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        throw error;
      }
      
      setTestResults(prev => ({ ...prev, supabaseAuth: 'success' }));
      addLog('✅ Supabase 클라이언트 연결 성공');
      addLog(`세션 상태: ${data.session ? '로그인됨' : '로그아웃됨'}`);
      
    } catch (error: any) {
      setTestResults(prev => ({ ...prev, supabaseAuth: 'error' }));
      addLog(`❌ Supabase 클라이언트 연결 실패: ${error.message}`);
    }

    setTesting(false);
  };

  const getStatusIcon = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Loader className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: 'pending' | 'success' | 'error') => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">성공</Badge>;
      case 'error':
        return <Badge variant="destructive">실패</Badge>;
      case 'pending':
        return <Badge variant="secondary">대기</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>연결 상태 진단</span>
          {testing && <Loader className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 테스트 결과 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.basicFetch)}
              <span>기본 네트워크 연결</span>
            </div>
            {getStatusBadge(testResults.basicFetch)}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.supabaseUrl)}
              <span>Supabase 서버 접근</span>
            </div>
            {getStatusBadge(testResults.supabaseUrl)}
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              {getStatusIcon(testResults.supabaseAuth)}
              <span>Supabase 클라이언트 연결</span>
            </div>
            {getStatusBadge(testResults.supabaseAuth)}
          </div>
        </div>

        {/* 테스트 버튼 */}
        <Button 
          onClick={testConnection} 
          disabled={testing}
          className="w-full"
        >
          {testing ? '테스트 중...' : '연결 테스트 시작'}
        </Button>

        {/* 로그 */}
        {logs.length > 0 && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">상세 로그:</h4>
            <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1 max-h-40 overflow-y-auto">
              {logs.map((log, index) => (
                <div key={index} className="font-mono text-xs">
                  {log}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 연결 정보 */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Supabase URL:</strong> https://jdkornpmgusbxsnxcmub.supabase.co</p>
          <p><strong>현재 시간:</strong> {new Date().toLocaleString()}</p>
          <p><strong>User Agent:</strong> {navigator.userAgent.split(' ')[0]}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConnectionTest;
