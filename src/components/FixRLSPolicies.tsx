import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';

const FixRLSPolicies: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ success: boolean; message: string }[]>([]);

  const fixRLSPolicies = async () => {
    setIsLoading(true);
    setResults([]);

    const migrations = [
      {
        name: "기존 문제 정책 삭제",
        sql: `
          DROP POLICY IF EXISTS "Users can view participants of their rooms" ON public.chat_participants;
          DROP POLICY IF EXISTS "Users can view rooms they participate in" ON public.chat_rooms;
          DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.messages;
          DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.messages;
          DROP POLICY IF EXISTS "Users can join rooms" ON public.chat_participants;
          DROP POLICY IF EXISTS "Users can view all chat participants" ON public.chat_participants;
          DROP POLICY IF EXISTS "Users can leave rooms" ON public.chat_participants;
        `
      },
      {
        name: "채팅 참여자 정책 생성",
        sql: `
          CREATE POLICY "Users can view all chat participants" ON public.chat_participants 
            FOR SELECT USING (true);
          
          CREATE POLICY "Users can insert chat participants" ON public.chat_participants 
            FOR INSERT WITH CHECK (
              auth.uid() = user_id OR 
              EXISTS (
                SELECT 1 FROM public.chat_rooms 
                WHERE id = room_id AND created_by = auth.uid()
              )
            );
          
          CREATE POLICY "Users can delete their participation" ON public.chat_participants 
            FOR DELETE USING (auth.uid() = user_id);
        `
      },
      {
        name: "채팅방 정책 생성",
        sql: `
          CREATE POLICY "Users can view chat rooms" ON public.chat_rooms 
            FOR SELECT USING (
              created_by = auth.uid() OR 
              id IN (
                SELECT DISTINCT room_id 
                FROM public.chat_participants 
                WHERE user_id = auth.uid()
              )
            );
          
          CREATE POLICY "Users can create chat rooms" ON public.chat_rooms 
            FOR INSERT WITH CHECK (auth.uid() = created_by);
          
          CREATE POLICY "Users can update their chat rooms" ON public.chat_rooms 
            FOR UPDATE USING (created_by = auth.uid());
        `
      },
      {
        name: "메시지 정책 생성",
        sql: `
          CREATE POLICY "Users can view messages in their rooms" ON public.messages 
            FOR SELECT USING (
              room_id IN (
                SELECT DISTINCT room_id 
                FROM public.chat_participants 
                WHERE user_id = auth.uid()
              )
            );
          
          CREATE POLICY "Users can send messages to their rooms" ON public.messages 
            FOR INSERT WITH CHECK (
              auth.uid() = sender_id AND
              room_id IN (
                SELECT DISTINCT room_id 
                FROM public.chat_participants 
                WHERE user_id = auth.uid()
              )
            );
        `
      },
      {
        name: "권한 및 인덱스 설정",
        sql: `
          GRANT SELECT ON public.chat_participants TO authenticated;
          GRANT INSERT ON public.chat_participants TO authenticated;
          GRANT DELETE ON public.chat_participants TO authenticated;
          GRANT SELECT ON public.chat_rooms TO authenticated;
          GRANT INSERT ON public.chat_rooms TO authenticated;
          GRANT UPDATE ON public.chat_rooms TO authenticated;
          GRANT SELECT ON public.messages TO authenticated;
          GRANT INSERT ON public.messages TO authenticated;
          GRANT SELECT ON public.profiles TO authenticated;
          GRANT SELECT ON public.friendships TO authenticated;
          
          CREATE INDEX IF NOT EXISTS idx_chat_participants_user_room ON public.chat_participants(user_id, room_id);
          CREATE INDEX IF NOT EXISTS idx_messages_room_created ON public.messages(room_id, created_at);
        `
      }
    ];

    for (const migration of migrations) {
      try {
        console.log(`실행 중: ${migration.name}`);
        
        const { error } = await supabase.rpc('exec_sql', { 
          sql_query: migration.sql 
        });

        if (error) {
          // RPC 함수가 없을 수 있으므로 직접 실행 시도
          console.log('RPC 실패, 직접 실행 시도');
          throw error;
        }

        setResults(prev => [...prev, {
          success: true,
          message: `✅ ${migration.name} - 완료`
        }]);

      } catch (error: any) {
        console.error(`${migration.name} 실패:`, error);
        setResults(prev => [...prev, {
          success: false,
          message: `❌ ${migration.name} - 실패: ${error.message}`
        }]);
        break; // 실패 시 중단
      }
    }

    setIsLoading(false);
  };

  const testConnection = async () => {
    setIsLoading(true);
    setResults([]);

    try {
      const { data, error } = await supabase
        .from('chat_rooms')
        .select('id')
        .limit(1);

      if (error) {
        setResults([{
          success: false,
          message: `❌ 연결 테스트 실패: ${error.message}`
        }]);
      } else {
        setResults([{
          success: true,
          message: '✅ 연결 테스트 성공'
        }]);
      }
    } catch (error: any) {
      setResults([{
        success: false,
        message: `❌ 연결 테스트 실패: ${error.message}`
      }]);
    }

    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>RLS 정책 수정</CardTitle>
          <CardDescription>
            무한 재귀 오류를 해결하기 위해 RLS 정책을 수정합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button 
              onClick={testConnection}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              연결 테스트
            </Button>
            
            <Button 
              onClick={fixRLSPolicies}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              RLS 정책 수정
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">실행 결과:</h3>
              {results.map((result, index) => (
                <Alert key={index} variant={result.success ? "default" : "destructive"}>
                  <div className="flex items-center gap-2">
                    {result.success ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500" />
                    )}
                    <AlertDescription className="text-sm">
                      {result.message}
                    </AlertDescription>
                  </div>
                </Alert>
              ))}
            </div>
          )}

          <Alert>
            <AlertDescription>
              <strong>주의:</strong> 이 도구가 작동하지 않으면 Supabase 대시보드에서 직접 SQL을 실행해야 합니다.
              <br />
              <a 
                href={`https://supabase.com/dashboard/project/${import.meta.env.VITE_SUPABASE_PROJECT_ID || "ufmymlvaqzfgasblvnaa"}/sql/new`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 underline"
              >
                Supabase SQL 에디터 열기
              </a>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default FixRLSPolicies;
