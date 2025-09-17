import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const DatabaseManager = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkCurrentTables = async () => {
    setLoading(true);
    setResult('🔍 현재 데이터베이스 테이블 구조 조사 중...\n\n');

    try {
      // PostgreSQL 시스템 테이블을 통해 현재 테이블 목록 조회
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_list');

      if (tablesError) {
        // RPC 함수가 없다면 직접 각 테이블을 확인
        setResult(prev => prev + '📋 각 테이블 개별 확인 중...\n');
        
        const tableNames = ['profiles', 'friendships', 'chat_rooms', 'chat_participants', 'messages', 
                           'payments', 'products', 'subscriptions', 'refunds', 'customer_payment_info'];
        
        for (const tableName of tableNames) {
          try {
            const { data, error } = await supabase
              .from(tableName as any)
              .select('*')
              .limit(1);
            
            if (!error) {
              setResult(prev => prev + `✅ ${tableName} 테이블 존재 (${data?.length || 0}개 데이터)\n`);
            }
          } catch (e) {
            setResult(prev => prev + `❌ ${tableName} 테이블 없음 또는 접근 불가\n`);
          }
        }
      } else {
        setResult(prev => prev + `✅ 테이블 목록:\n${JSON.stringify(tables, null, 2)}\n\n`);
      }

      setResult(prev => prev + '\n🗂️ 각 테이블 샘플 데이터 확인...\n');

      // 각 테이블의 구조 확인
      const checkTable = async (tableName: string) => {
        try {
          const { data, error } = await supabase
            .from(tableName as any)
            .select('*')
            .limit(1);
          
          if (error) {
            setResult(prev => prev + `❌ ${tableName}: ${error.message}\n`);
          } else {
            setResult(prev => prev + `✅ ${tableName}: ${data?.length || 0}개 데이터\n`);
            if (data && data.length > 0) {
              setResult(prev => prev + `   구조: ${Object.keys(data[0]).join(', ')}\n`);
            }
          }
        } catch (e: any) {
          setResult(prev => prev + `❌ ${tableName}: 예외 - ${e.message}\n`);
        }
      };

      await checkTable('profiles');
      await checkTable('friendships');
      await checkTable('chat_rooms');
      await checkTable('chat_participants');
      await checkTable('messages');
      await checkTable('payments');
      await checkTable('products');
      await checkTable('subscriptions');

      setResult(prev => prev + '\n✅ 데이터베이스 구조 조사 완료!');

    } catch (error: any) {
      setResult(prev => prev + `❌ 예외 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const dropAllTables = async () => {
    if (!confirm('⚠️ 정말로 모든 테이블을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다!')) {
      return;
    }

    setLoading(true);
    setResult('🗑️ 모든 테이블 삭제 중...\n\n');

    try {
      // 외래 키 제약 조건 때문에 순서대로 삭제
      const dropOrder = [
        'chat_participants',
        'messages', 
        'chat_rooms',
        'friendships',
        'refunds',
        'subscriptions',
        'payments',
        'customer_payment_info',
        'products',
        'profiles'
      ];

      for (const tableName of dropOrder) {
        try {
          setResult(prev => prev + `🗑️ ${tableName} 테이블 삭제 중...\n`);
          
          // 데이터만 삭제 (테이블 구조는 유지)
          const { error } = (await supabase
            .from(tableName as any)
            .delete() as any)
            .neq('id', '00000000-0000-0000-0000-000000000000'); // 모든 데이터 삭제 시도
          
          if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
            setResult(prev => prev + `⚠️ ${tableName}: ${error.message}\n`);
          } else {
            setResult(prev => prev + `✅ ${tableName} 데이터 삭제됨\n`);
          }
        } catch (e: any) {
          setResult(prev => prev + `❌ ${tableName}: ${e.message}\n`);
        }
      }

      setResult(prev => prev + '\n⚠️ 참고: Supabase API로는 테이블 구조 자체를 삭제할 수 없습니다.\n');
      setResult(prev => prev + '💡 테이블 스키마 변경은 Supabase 대시보드에서 수행해야 합니다.\n');
      setResult(prev => prev + `🔗 https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_PROJECT_ID || "ufmymlvaqzfgasblvnaa"}/editor\n`);

    } catch (error: any) {
      setResult(prev => prev + `❌ 예외 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const createNewTables = async () => {
    setLoading(true);
    setResult('🏗️ 새로운 메신저 앱용 테이블 생성 중...\n\n');

    try {
      setResult(prev => prev + '⚠️ 참고: Supabase API로는 테이블 생성이 불가능합니다.\n');
      setResult(prev => prev + '💡 다음 SQL을 Supabase 대시보드에서 실행해주세요:\n\n');
      
      const sql = `
-- 1. profiles 테이블 (사용자 프로필)
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'offline',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. friendships 테이블 (친구 관계)
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(requester_id, addressee_id)
);

-- 3. chat_rooms 테이블 (채팅방)
CREATE TABLE chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  is_group BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. chat_participants 테이블 (채팅방 참가자)
CREATE TABLE chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id, user_id)
);

-- 5. messages 테이블 (메시지)
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'ai')),
  ai_persona TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS 정책 설정
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (모든 사용자가 읽기/쓰기 가능하도록 임시 설정)
CREATE POLICY "profiles_policy" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "friendships_policy" ON friendships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "chat_rooms_policy" ON chat_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "chat_participants_policy" ON chat_participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "messages_policy" ON messages FOR ALL USING (true) WITH CHECK (true);

-- 인덱스 생성
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_chat_participants_room ON chat_participants(room_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX idx_messages_room ON messages(room_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
`;

      setResult(prev => prev + sql);
      setResult(prev => prev + `\n\n🔗 Supabase SQL Editor: https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_PROJECT_ID || "ufmymlvaqzfgasblvnaa"}/sql/new\n`);

    } catch (error: any) {
      setResult(prev => prev + `❌ 예외 발생: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>🗂️ 데이터베이스 관리자</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 flex-wrap">
          <Button 
            onClick={checkCurrentTables}
            disabled={loading}
          >
            {loading ? '조사 중...' : '현재 테이블 확인'}
          </Button>
          <Button 
            onClick={dropAllTables}
            disabled={loading}
            variant="destructive"
          >
            {loading ? '삭제 중...' : '모든 데이터 삭제'}
          </Button>
          <Button 
            onClick={createNewTables}
            disabled={loading}
            variant="outline"
          >
            {loading ? '생성 중...' : '새 테이블 SQL 생성'}
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
