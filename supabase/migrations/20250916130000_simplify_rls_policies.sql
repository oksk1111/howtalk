-- 간소화된 RLS 정책 수정
-- 더 간단하고 안정적인 정책들로 교체

-- 기존 문제 있는 정책들 삭제
DROP POLICY IF EXISTS "Users can view chat rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Users can view participants of their rooms" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can view messages in their rooms" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages to their rooms" ON public.messages;
DROP POLICY IF EXISTS "Users can view all chat participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Users can insert chat participants" ON public.chat_participants;

-- 새로운 간소화된 정책들 (디버깅용 - 매우 관대함)

-- Chat rooms: 매우 관대한 정책 
CREATE POLICY "Allow all chat rooms access" ON public.chat_rooms 
  FOR ALL USING (true);

-- Chat participants: 매우 관대한 정책   
CREATE POLICY "Allow all chat participants access" ON public.chat_participants 
  FOR ALL USING (true);

-- Messages: 매우 관대한 정책
CREATE POLICY "Allow all messages access" ON public.messages 
  FOR ALL USING (true);

-- 추가 권한 부여
GRANT ALL ON public.chat_rooms TO authenticated;
GRANT ALL ON public.chat_participants TO authenticated;
GRANT ALL ON public.messages TO authenticated;
GRANT ALL ON public.friendships TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
