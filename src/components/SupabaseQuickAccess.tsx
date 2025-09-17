import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink, Database, Trash2, Plus } from 'lucide-react';

export const SupabaseQuickAccess = () => {
  const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID || 'ufmymlvaqzfgasblvnaa';
  
  const openDashboard = () => {
    window.open(`https://supabase.com/dashboard/project/${projectRef}`, '_blank');
  };

  const openSQLEditor = () => {
    window.open(`https://supabase.com/dashboard/project/${projectRef}/sql/new`, '_blank');
  };

  const openTableEditor = () => {
    window.open(`https://supabase.com/dashboard/project/${projectRef}/editor`, '_blank');
  };

  const dropAllTablesSQL = `-- ⚠️ 주의: 이 스크립트는 모든 테이블과 데이터를 삭제합니다!
-- 순서대로 실행하여 외래 키 제약 조건 문제를 방지합니다.

-- 1. 모든 RLS 정책 삭제
DROP POLICY IF EXISTS "profiles_policy" ON profiles;
DROP POLICY IF EXISTS "friendships_policy" ON friendships;
DROP POLICY IF EXISTS "chat_rooms_policy" ON chat_rooms;
DROP POLICY IF EXISTS "chat_participants_policy" ON chat_participants;
DROP POLICY IF EXISTS "messages_policy" ON messages;
DROP POLICY IF EXISTS "payments_policy" ON payments;
DROP POLICY IF EXISTS "products_policy" ON products;
DROP POLICY IF EXISTS "subscriptions_policy" ON subscriptions;
DROP POLICY IF EXISTS "refunds_policy" ON refunds;
DROP POLICY IF EXISTS "customer_payment_info_policy" ON customer_payment_info;

-- 2. 테이블 삭제 (외래 키 순서 고려)
DROP TABLE IF EXISTS chat_participants CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS chat_rooms CASCADE;
DROP TABLE IF EXISTS friendships CASCADE;
DROP TABLE IF EXISTS refunds CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS customer_payment_info CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 3. 함수 삭제 (있다면)
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;`;

  const createNewTablesSQL = `-- 🏗️ HowTalk 메신저 앱용 새로운 테이블 스키마
-- 결제 관련 테이블을 제거하고 메신저 기능에 집중

-- 1. 업데이트 시간 관리 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. profiles 테이블 (사용자 프로필)
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'away')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. friendships 테이블 (친구 관계)
CREATE TABLE friendships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requester_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  addressee_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(requester_id, addressee_id)
);

-- 4. chat_rooms 테이블 (채팅방)
CREATE TABLE chat_rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  is_group BOOLEAN DEFAULT false,
  created_by UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. chat_participants 테이블 (채팅방 참가자)
CREATE TABLE chat_participants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES profiles(user_id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(room_id, user_id)
);

-- 6. messages 테이블 (메시지)
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

-- 7. 트리거 설정 (자동 updated_at 업데이트)
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 9. 개발 단계에서는 모든 작업 허용 (보안 정책은 나중에 강화)
CREATE POLICY "profiles_all_access" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "friendships_all_access" ON friendships FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "chat_rooms_all_access" ON chat_rooms FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "chat_participants_all_access" ON chat_participants FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "messages_all_access" ON messages FOR ALL USING (true) WITH CHECK (true);

-- 10. 성능을 위한 인덱스
CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);
CREATE INDEX idx_chat_participants_room ON chat_participants(room_id);
CREATE INDEX idx_chat_participants_user ON chat_participants(user_id);
CREATE INDEX idx_messages_room ON messages(room_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- 완료!`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('SQL이 클립보드에 복사되었습니다!');
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Supabase 빠른 접근
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 대시보드 링크 */}
        <div className="grid gap-3 md:grid-cols-3">
          <Button onClick={openDashboard} variant="outline" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            대시보드
          </Button>
          <Button onClick={openSQLEditor} variant="outline" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            SQL 에디터
          </Button>
          <Button onClick={openTableEditor} variant="outline" className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            테이블 에디터
          </Button>
        </div>

        {/* SQL 스크립트 섹션 */}
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-2">
              <Trash2 className="h-4 w-4" />
              1단계: 기존 테이블 모두 삭제
            </h3>
            <p className="text-sm text-red-600 mb-3">
              ⚠️ 이 스크립트는 모든 기존 테이블과 데이터를 삭제합니다. 되돌릴 수 없으니 신중하게 실행하세요.
            </p>
            <Button 
              onClick={() => copyToClipboard(dropAllTablesSQL)}
              variant="destructive"
              size="sm"
            >
              삭제 SQL 복사
            </Button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 flex items-center gap-2 mb-2">
              <Plus className="h-4 w-4" />
              2단계: 새로운 메신저 테이블 생성
            </h3>
            <p className="text-sm text-green-600 mb-3">
              결제 기능 없이 메신저 앱에 필요한 테이블들만 생성합니다.
            </p>
            <Button 
              onClick={() => copyToClipboard(createNewTablesSQL)}
              variant="default"
              size="sm"
            >
              생성 SQL 복사
            </Button>
          </div>
        </div>

        {/* 작업 순서 안내 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">📋 작업 순서</h3>
          <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
            <li>위의 "SQL 에디터" 버튼을 클릭하여 Supabase SQL 에디터를 엽니다</li>
            <li>"삭제 SQL 복사" 버튼을 클릭하고 SQL 에디터에 붙여넣어 실행합니다</li>
            <li>"생성 SQL 복사" 버튼을 클릭하고 SQL 에디터에 붙여넣어 실행합니다</li>
            <li>웹앱으로 돌아와서 친구 추가 기능을 테스트합니다</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
