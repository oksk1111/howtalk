# 채팅방 생성 에러 해결 SQL

## 문제
- 채팅방 생성 시 `chat_participants` 테이블에 INSERT할 때 403 Forbidden 에러
- RLS 정책에서 INSERT 권한이 제대로 설정되지 않음

## 해결 방법

Supabase 대시보드 SQL 에디터에서 다음 SQL을 실행하세요:

```sql
-- 1. 기존 문제가 있는 정책들 삭제
DROP POLICY IF EXISTS "Users can join rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view all chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can leave rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view participants of their rooms" ON public.chat_participants;

-- 2. 새로운 chat_participants 정책 생성
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

-- 3. 필요한 권한 부여
GRANT INSERT ON public.chat_participants TO authenticated;
GRANT DELETE ON public.chat_participants TO authenticated;
GRANT INSERT ON public.chat_rooms TO authenticated;
GRANT UPDATE ON public.chat_rooms TO authenticated;
GRANT INSERT ON public.messages TO authenticated;

-- 4. 확인용 쿼리 (실행 후 결과 확인)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'chat_participants';
```

## 대시보드 링크
https://supabase.com/dashboard/project/ufmymlvaqzfgasblvnaa/sql/new

## 설명
- 기존 정책은 사용자가 자신만 추가할 수 있도록 제한되어 있었음
- 새 정책은 채팅방 생성자가 다른 사용자를 추가할 수 있도록 허용
- `auth.uid() = user_id` : 본인 참여
- `EXISTS (...)` : 채팅방 생성자가 다른 사람을 추가하는 경우

## 실행 후 테스트
1. 브라우저에서 앱 새로고침
2. 친구와 채팅방 생성 시도
3. 정상 작동 확인
