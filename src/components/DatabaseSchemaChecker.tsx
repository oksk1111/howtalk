import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DatabaseSchemaChecker = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkSchema = async () => {
    setLoading(true);
    setResult('🔍 데이터베이스 스키마 조사 중...\n\n');

    try {
      // 1. profiles 테이블 스키마 확인
      setResult(prev => prev + '📋 1. profiles 테이블 데이터 확인...\n');
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(3);

      if (profilesError) {
        setResult(prev => prev + `❌ profiles 에러: ${profilesError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ profiles 테이블 (${profiles.length}개 데이터):\n${JSON.stringify(profiles, null, 2)}\n\n`);
      }

      // 2. friendships 테이블 스키마 확인
      setResult(prev => prev + '👥 2. friendships 테이블 데이터 확인...\n');
      const { data: friendships, error: friendshipsError } = await supabase
        .from('friendships')
        .select('*')
        .limit(3);

      if (friendshipsError) {
        setResult(prev => prev + `❌ friendships 에러: ${friendshipsError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ friendships 테이블 (${friendships.length}개 데이터):\n${JSON.stringify(friendships, null, 2)}\n\n`);
      }

      // 3. chat_rooms 테이블 확인
      setResult(prev => prev + '💬 3. chat_rooms 테이블 데이터 확인...\n');
      const { data: chatRooms, error: chatRoomsError } = await supabase
        .from('chat_rooms')
        .select('*')
        .limit(3);

      if (chatRoomsError) {
        setResult(prev => prev + `❌ chat_rooms 에러: ${chatRoomsError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ chat_rooms 테이블 (${chatRooms.length}개 데이터):\n${JSON.stringify(chatRooms, null, 2)}\n\n`);
      }

      // 4. messages 테이블 확인
      setResult(prev => prev + '📨 4. messages 테이블 데이터 확인...\n');
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .limit(3);

      if (messagesError) {
        setResult(prev => prev + `❌ messages 에러: ${messagesError.message}\n\n`);
      } else {
        setResult(prev => prev + `✅ messages 테이블 (${messages.length}개 데이터):\n${JSON.stringify(messages, null, 2)}\n\n`);
      }

      setResult(prev => prev + '🎉 스키마 조사 완료!');

    } catch (error: any) {
      setResult(prev => prev + `❌ 예외 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testInsertProfile = async () => {
    setLoading(true);
    setResult('🧪 테스트 프로필 생성 시도...\n\n');

    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testUserId = `test-user-${Date.now()}`;

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: testUserId,
          email: testEmail,
          display_name: 'Test User'
        } as any)
        .select()
        .single();

      if (error) {
        setResult(prev => prev + `❌ 프로필 생성 실패: ${error.message}\n코드: ${error.code}\n상세: ${JSON.stringify(error, null, 2)}`);
      } else {
        setResult(prev => prev + `✅ 프로필 생성 성공:\n${JSON.stringify(data, null, 2)}`);
      }

    } catch (error: any) {
      setResult(prev => prev + `❌ 예외 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>데이터베이스 스키마 확인</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={checkSchema}
            disabled={loading}
          >
            {loading ? '조사 중...' : '스키마 확인'}
          </Button>
          <Button 
            onClick={testInsertProfile}
            disabled={loading}
            variant="outline"
          >
            {loading ? '테스트 중...' : '테스트 프로필 생성'}
          </Button>
          <Button 
            onClick={() => setResult('')}
            variant="outline"
          >
            지우기
          </Button>
        </div>

        {result && (
          <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
            {result}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
